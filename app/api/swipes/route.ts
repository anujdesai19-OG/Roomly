import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { swipeSchema } from '@/lib/validators/swipe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = swipeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { sessionId, productId, room, direction } = parsed.data

    const swipe = await prisma.swipe.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { direction, room },
      create: { sessionId, productId, direction, room },
    })

    const likeCount = await prisma.swipe.count({
      where: { sessionId, room, direction: 'LIKE' },
    })

    return NextResponse.json({ swipeId: swipe.id, likeCount }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/swipes]', err)
    return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 })
  }
}
