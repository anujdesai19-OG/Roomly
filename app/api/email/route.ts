import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPlanEmail } from '@/lib/resend'
import { sendEmailSchema } from '@/lib/validators/plan'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendEmailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { sessionId, planId } = parsed.data

    const [session, plan, retailer] = await Promise.all([
      prisma.session.findUnique({ where: { id: sessionId } }),
      prisma.plan.findUnique({ where: { id: planId } }),
      prisma.session.findUnique({ where: { id: sessionId }, include: { retailer: true } }).then((s) => s?.retailer),
    ])

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    if (!session.email) return NextResponse.json({ error: 'No email on session' }, { status: 400 })
    if (!retailer) return NextResponse.json({ error: 'Retailer not found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const shareUrl = `${appUrl}/share/${plan.shareToken}`

    const result = await sendPlanEmail({
      to: session.email,
      shopperName: session.shopperName ?? 'there',
      shareUrl,
      retailerName: retailer.name,
      fromEmail: process.env.RESEND_FROM_EMAIL ?? retailer.contactEmail,
    })

    await prisma.plan.update({
      where: { id: planId },
      data: { emailedAt: new Date() },
    })

    await prisma.session.update({
      where: { id: sessionId },
      data: { currentStep: 'COMPLETE', completedAt: new Date() },
    })

    return NextResponse.json({ messageId: result.data?.id, emailedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[POST /api/email]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
