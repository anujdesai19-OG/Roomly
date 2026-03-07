import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Returns style-matched products not already in the plan, prioritising missing functional categories
export async function GET(_req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        items: { include: { product: true } },
        session: true,
      },
    })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const existingProductIds = plan.items.map((i) => i.productId)
    const existingCategories = [...new Set(plan.items.map((i) => i.product.category))]
    const rooms = [...new Set(plan.items.map((i) => i.room))]
    const session = plan.session

    // Style tags from the plan items to match against
    const styleIds = [...new Set(plan.items.flatMap((i) => i.product.styleIds))].slice(0, 4)
    const colorPalette = session.colorPalette.filter((p) => !p.startsWith('wall:'))

    // Find products not in the plan that share style tags or color family
    const candidates = await prisma.product.findMany({
      where: {
        retailerId: session.retailerId,
        inStock: true,
        id: { notIn: existingProductIds },
        room: { hasSome: rooms },
        OR: [
          { styleIds: { hasSome: styleIds } },
          { colorFamily: { hasSome: colorPalette } },
        ],
      },
      take: 12,
      orderBy: { priceUsd: 'asc' },
    })

    // Prioritise categories not yet in the plan
    const missing = candidates.filter((p) => !existingCategories.includes(p.category))
    const supplementary = candidates.filter((p) => existingCategories.includes(p.category))

    const recommendations = [...missing, ...supplementary].slice(0, 6)

    return NextResponse.json({ recommendations })
  } catch (err) {
    console.error('[GET /api/plans/:id/recommendations]', err)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
