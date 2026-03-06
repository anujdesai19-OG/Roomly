import { NextRequest, NextResponse } from 'next/server'
import { getSessionById, updateSession } from '@/lib/session'
import { updateSessionSchema } from '@/lib/validators/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const session = await getSessionById(sessionId)
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    return NextResponse.json({ session })
  } catch (err) {
    console.error('[GET /api/sessions/:id]', err)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const body = await req.json()
    const parsed = updateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const session = await updateSession(sessionId, parsed.data)
    return NextResponse.json({ session: { id: session.id, currentStep: session.currentStep, updatedAt: session.updatedAt } })
  } catch (err) {
    console.error('[PATCH /api/sessions/:id]', err)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
