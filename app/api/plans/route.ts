import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { anthropic, QUALITY_MODEL } from '@/lib/claude'
import { getLikedProductsForSession } from '@/lib/session'
import { buildPlanPrompt } from '@/lib/prompts/plan'
import { generatePlanSchema } from '@/lib/validators/plan'
import type { RoomType } from '@/types/session'
import type { ClaudePlanOutput } from '@/types/plan'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = generatePlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { sessionId, floorPlanImage } = parsed.data
    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const rooms = session.selectedRooms as RoomType[]
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'No rooms selected' }, { status: 400 })
    }

    // Gather liked products per room
    const likedByRoom: Record<string, Array<{ id: string; name: string; priceUsd: number; category: string; styleIds: string[]; colorFamily: string[] }>> = {}
    const dislikedStyleTags: string[] = []

    for (const room of rooms) {
      const liked = await getLikedProductsForSession(sessionId, room)
      likedByRoom[room] = liked.map((s) => ({
        id: s.product.id,
        name: s.product.name,
        priceUsd: s.product.priceUsd,
        category: s.product.category,
        styleIds: s.product.styleIds,
        colorFamily: s.product.colorFamily,
      }))
    }

    // Infer disliked style tags
    const disliked = await prisma.swipe.findMany({
      where: { sessionId, direction: 'DISLIKE' },
      include: { product: true },
    })
    disliked.forEach((s) => dislikedStyleTags.push(...s.product.styleIds))

    const addressMeta = session.addressMeta as Record<string, unknown> | null
    const prompt = buildPlanPrompt({
      shopperName: session.shopperName ?? 'there',
      designStyle: session.designStyle ?? 'modern',
      colorPalette: session.colorPalette,
      rooms,
      likedByRoom,
      budgetCentsByRoom: session.budgetCents as Record<string, number> | null,
      dislikedStyleTags: [...new Set(dislikedStyleTags)],
      floorPlanNote: typeof addressMeta?.floorPlanNote === 'string' ? addressMeta.floorPlanNote : null,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let rawJson = ''

          const userContent: Parameters<typeof anthropic.messages.stream>[0]['messages'][0]['content'] = floorPlanImage
            ? [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: floorPlanImage } },
                { type: 'text', text: prompt },
              ]
            : prompt

          const claudeStream = anthropic.messages.stream({
            model: QUALITY_MODEL,
            max_tokens: 4096,
            messages: [{ role: 'user', content: userContent }],
          })

          // Stream rationale tokens to client as they arrive
          for await (const chunk of claudeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              rawJson += chunk.delta.text
              // Stream raw text chunks for progressive rendering
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk.delta.text })}\n\n`)
              )
            }
          }

          // Parse the complete JSON response
          let planOutput: ClaudePlanOutput
          try {
            const start = rawJson.indexOf('{')
            const end = rawJson.lastIndexOf('}')
            planOutput = JSON.parse(rawJson.slice(start, end + 1))
          } catch {
            throw new Error('Claude returned invalid JSON for plan')
          }

          // Validate all product IDs exist
          const allProductIds = planOutput.rooms.flatMap((r) => r.items.map((i) => i.productId))
          const existingProducts = await prisma.product.findMany({
            where: { id: { in: allProductIds } },
            select: { id: true, priceUsd: true },
          })
          const validIds = new Set(existingProducts.map((p) => p.id))

          // Persist the plan
          const plan = await prisma.plan.create({
            data: {
              sessionId,
              styleRationale: planOutput.styleRationale,
              layoutJson: planOutput.rooms as never,
              totalCents: planOutput.totalCents,
              refinements: '[]',
              items: {
                create: planOutput.rooms.flatMap((roomData) =>
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
          })

          // Update session step
          await prisma.session.update({
            where: { id: sessionId },
            data: { currentStep: 'PLAN' },
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', planId: plan.id, shareToken: plan.shareToken, totalCents: plan.totalCents })}\n\n`)
          )
          controller.close()
        } catch (err) {
          console.error('[plans stream] Claude error — falling back to liked-products plan', err)
          try {
            // Build a plan directly from liked products without Claude
            const fallbackRooms = rooms.map((room) => ({
              room,
              items: (likedByRoom[room] ?? []).map((p) => ({ productId: p.id, quantity: 1, noteFromAI: null, position: null })),
            }))
            const allLikedIds = fallbackRooms.flatMap((r) => r.items.map((i) => i.productId))
            const likedProducts = await prisma.product.findMany({ where: { id: { in: allLikedIds } }, select: { id: true, priceUsd: true } })
            const totalCents = likedProducts.reduce((sum, p) => sum + p.priceUsd, 0)
            const styleRationale = `A curated selection of your favorites, styled to complement your ${session.designStyle ?? 'chosen'} aesthetic.`

            const plan = await prisma.plan.create({
              data: {
                sessionId,
                styleRationale,
                layoutJson: fallbackRooms as never,
                totalCents,
                refinements: '[]',
                items: {
                  create: fallbackRooms.flatMap((roomData) =>
                    roomData.items.map((item) => ({
                      product: { connect: { id: item.productId } },
                      room: roomData.room,
                      quantity: 1,
                      noteFromAI: null,
                      position: null as never,
                    }))
                  ),
                },
              },
            })
            await prisma.session.update({ where: { id: sessionId }, data: { currentStep: 'PLAN' } })
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: styleRationale })}\n\n`))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', planId: plan.id, shareToken: plan.shareToken, totalCents: plan.totalCents, fallback: true })}\n\n`))
          } catch (fallbackErr) {
            console.error('[plans stream] fallback also failed', fallbackErr)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Plan generation failed' })}\n\n`))
          }
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
    console.error('[POST /api/plans]', err)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
