import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { anthropic, QUALITY_MODEL } from '@/lib/claude'
import { getSwapCandidates } from '@/lib/catalog'
import { buildRefinePrompt } from '@/lib/prompts/refine'
import { refinePlanSchema } from '@/lib/validators/plan'
import type { RoomType } from '@/types/session'
import type { ClaudePlanOutput } from '@/types/plan'

export async function POST(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params
    const body = await req.json()
    const parsed = refinePlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { instruction, sessionId } = parsed.data

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { items: { include: { product: true } } },
    })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // Get all product IDs already in the plan
    const existingIds = plan.items.map((i) => i.productId)
    const rooms = [...new Set(plan.items.map((i) => i.room))] as RoomType[]

    // Find swap candidates for each room
    const allSwaps = await Promise.all(
      rooms.map((room) =>
        getSwapCandidates({
          retailerId: session.retailerId,
          room,
          maxPriceCents: 300000, // $3000 ceiling
          excludeProductIds: existingIds,
          limit: 15,
        })
      )
    )
    const swapProducts = allSwaps.flat()

    const prompt = buildRefinePrompt({
      currentPlanJson: JSON.stringify(plan.layoutJson),
      instruction,
      availableSwaps: swapProducts.map((p) => ({
        id: p.id,
        name: p.name,
        priceUsd: p.priceUsd,
        category: p.category,
        styleIds: p.styleIds,
        colorFamily: p.colorFamily,
      })),
      designStyle: session.designStyle ?? 'modern',
      colorPalette: session.colorPalette,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let rawJson = ''

          const claudeStream = anthropic.messages.stream({
            model: QUALITY_MODEL,
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          })

          for await (const chunk of claudeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              rawJson += chunk.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk.delta.text })}\n\n`))
            }
          }

          let updatedPlan: ClaudePlanOutput & { changesSummary?: string }
          try {
            const start = rawJson.indexOf('{')
            const end = rawJson.lastIndexOf('}')
            updatedPlan = JSON.parse(rawJson.slice(start, end + 1))
          } catch {
            throw new Error('Claude returned invalid JSON for refinement')
          }

          // Validate product IDs in the updated plan
          const allIds = updatedPlan.rooms?.flatMap((r) => r.items.map((i) => i.productId)) ?? []
          const validProducts = await prisma.product.findMany({
            where: { id: { in: allIds } },
            select: { id: true },
          })
          const validIds = new Set(validProducts.map((p) => p.id))

          // Delete old items and create new ones
          const refinements = Array.isArray(JSON.parse(plan.refinements as string))
            ? (JSON.parse(plan.refinements as string) as object[])
            : []

          await prisma.$transaction([
            prisma.planItem.deleteMany({ where: { planId } }),
            prisma.plan.update({
              where: { id: planId },
              data: {
                styleRationale: updatedPlan.styleRationale,
                layoutJson: updatedPlan.rooms as never,
                totalCents: updatedPlan.totalCents,
                version: { increment: 1 },
                refinements: JSON.stringify([
                  ...refinements,
                  { instruction, changesSummary: updatedPlan.changesSummary ?? '', appliedAt: new Date().toISOString() },
                ]),
                items: {
                  create: (updatedPlan.rooms ?? []).flatMap((roomData) =>
                    roomData.items
                      .filter((item) => validIds.has(item.productId))
                      .map((item) => ({
                        product: { connect: { id: item.productId } },
                        room: roomData.room,
                        quantity: item.quantity ?? 1,
                        noteFromAI: item.noteFromAI ?? null,
                        position: (item.position ?? null) as never,
                      }))
                  ),
                },
              },
            }),
          ])

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', planId, version: (plan.version + 1), changesSummary: updatedPlan.changesSummary ?? '' })}\n\n`))
          controller.close()
        } catch (err) {
          console.error('[refine stream]', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Refinement failed' })}\n\n`))
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[POST /api/plans/:id/refine]', err)
    return NextResponse.json({ error: 'Failed to refine plan' }, { status: 500 })
  }
}
