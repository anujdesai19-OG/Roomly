import { NextRequest, NextResponse } from 'next/server'
import { createSession, getSessionByEmail, getSessionByResumeToken } from '@/lib/session'
import { createSessionSchema } from '@/lib/validators/session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const session = await createSession(parsed.data)
    return NextResponse.json(
      { sessionId: session.id, resumeToken: session.resumeToken, currentStep: session.currentStep },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/sessions]', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const retailerId = searchParams.get('retailerId')
    const resumeToken = searchParams.get('resumeToken')

    if (resumeToken) {
      const session = await getSessionByResumeToken(resumeToken)
      return NextResponse.json({ session: session ?? null })
    }

    if (email && retailerId) {
      const session = await getSessionByEmail(email, retailerId)
      return NextResponse.json({
        session: session
          ? { sessionId: session.id, currentStep: session.currentStep, resumeToken: session.resumeToken, completedAt: session.completedAt }
          : null,
      })
    }

    return NextResponse.json({ error: 'Provide email+retailerId or resumeToken' }, { status: 400 })
  } catch (err) {
    console.error('[GET /api/sessions]', err)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}
