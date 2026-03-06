import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { anthropic, FAST_MODEL } from '@/lib/claude'
import { getFilteredCatalog } from '@/lib/catalog'
import { getSwipedProductIds } from '@/lib/session'
import { buildRecommendationPrompt } from '@/lib/prompts/recommendations'
import type { RoomType } from '@/types/session'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, room } = await req.json() as { sessionId: string; room: RoomType }

    if (!sessionId || !room) {
      return NextResponse.json({ error: 'sessionId and room are required' }, { status: 400 })
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const alreadySeen = await getSwipedProductIds(sessionId)
    const budgetCents = (session.budgetCents as Record<string, number> | null)?.[room] ?? null

    // Pre-filter catalog before sending to Claude
    const catalog = await getFilteredCatalog({
      retailerId: session.retailerId,
      room,
      maxBudgetCents: budgetCents ?? undefined,
      excludeProductIds: alreadySeen,
      limit: 40,
    })

    if (catalog.length === 0) {
      return NextResponse.json({ rankedIds: [], totalProducts: 0 })
    }

    // Build prompt and ask Claude to rank
    const prompt = buildRecommendationPrompt({
      room,
      designStyle: session.designStyle ?? 'modern',
      colorPalette: session.colorPalette,
      budgetCents,
      catalog: catalog.map((p) => ({
        id: p.id,
        name: p.name,
        priceUsd: p.priceUsd,
        styleIds: p.styleIds,
        colorFamily: p.colorFamily,
        category: p.category,
      })),
    })

    // Stream the response so the client can start rendering immediately
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let rawJson = ''

          const claudeStream = anthropic.messages.stream({
            model: FAST_MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          })

          for await (const chunk of claudeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              rawJson += chunk.delta.text
            }
          }

          // Parse ranked IDs
          let rankedIds: string[] = []
          try {
            const start = rawJson.indexOf('[')
            const end = rawJson.lastIndexOf(']')
            if (start !== -1 && end !== -1) {
              rankedIds = JSON.parse(rawJson.slice(start, end + 1))
            }
          } catch {
            // Fallback: return catalog in original order
            rankedIds = catalog.map((p) => p.id)
          }

          // Resolve full product objects in ranked order
          const productMap = new Map(catalog.map((p) => [p.id, p]))
          const ranked = rankedIds
            .map((id) => productMap.get(id))
            .filter(Boolean)

          // Stream each product as an SSE event
          for (const product of ranked) {
            const event = `data: ${JSON.stringify({ type: 'product', product })}\n\n`
            controller.enqueue(encoder.encode(event))
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', totalSent: ranked.length })}\n\n`))
          controller.close()
        } catch (err) {
          console.error('[recommendations stream] Claude error — falling back to catalog order', err)
          // Claude unavailable: stream catalog in default price order so the UI still works
          for (const product of catalog) {
            const event = `data: ${JSON.stringify({ type: 'product', product })}\n\n`
            controller.enqueue(encoder.encode(event))
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', totalSent: catalog.length, fallback: true })}\n\n`))
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
    console.error('[POST /api/recommendations]', err)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// Non-streaming endpoint: returns next batch by cursor
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const room = searchParams.get('room') as RoomType | null
    if (!sessionId || !room) {
      return NextResponse.json({ error: 'sessionId and room are required' }, { status: 400 })
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const alreadySeen = await getSwipedProductIds(sessionId)
    const budgetCents = (session.budgetCents as Record<string, number> | null)?.[room] ?? null

    const products = await getFilteredCatalog({
      retailerId: session.retailerId,
      room,
      maxBudgetCents: budgetCents ?? undefined,
      excludeProductIds: alreadySeen,
      limit: 10,
    })

    return NextResponse.json({ products, hasMore: products.length === 10, cursor: null })
  } catch (err) {
    console.error('[GET /api/recommendations]', err)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
