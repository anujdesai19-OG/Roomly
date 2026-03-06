import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        items: {
          include: { product: true },
          orderBy: { room: 'asc' },
        },
      },
    })

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    return NextResponse.json({ plan })
  } catch (err) {
    console.error('[GET /api/plans/:id]', err)
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
}
