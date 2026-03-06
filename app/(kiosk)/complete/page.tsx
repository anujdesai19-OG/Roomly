'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { useSessionContext } from '@/components/providers/SessionProvider'
import { toast } from 'sonner'

function CompleteContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  const sessionIdParam = searchParams.get('sessionId')

  const { session, clearSession } = useSessionContext()
  const sessionId = sessionIdParam ?? session?.id ?? ''

  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) return
    fetch(`/api/plans/${planId}`)
      .then((r) => r.json())
      .then(({ plan }) => {
        if (plan?.shareToken) {
          setShareUrl(`${window.location.origin}/share/${plan.shareToken}`)
        }
      })
      .catch(() => null)
  }, [planId])

  async function sendEmail() {
    if (!planId || !sessionId) return
    setSending(true)
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, planId }),
      })
      if (!res.ok) throw new Error('Failed to send email')
      setEmailSent(true)
      toast.success('Plan sent to your email!')
    } catch {
      toast.error('Could not send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="COMPLETE" />

      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold">Your room plan is ready!</h1>
        <p className="text-muted-foreground">
          {emailSent
            ? `We've sent your plan to ${session?.email ?? 'your email'}.`
            : 'Email yourself the plan to save it and shop from anywhere.'}
        </p>
      </div>

      {/* Email CTA */}
      {!emailSent ? (
        <Button onClick={sendEmail} disabled={sending || !planId} className="w-full h-12 text-base">
          {sending ? 'Sending...' : `Email Plan to ${session?.email ?? 'me'}`}
        </Button>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950">
          <p className="font-medium text-green-800 dark:text-green-200">✓ Plan sent to {session?.email}</p>
        </div>
      )}

      {/* Share link */}
      {shareUrl && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <p className="text-sm font-semibold">Share your plan</p>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!') }}
            >
              Copy
            </Button>
          </div>
          <div className="flex justify-center pt-2">
            <QRCodeSVG value={shareUrl} size={140} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1 h-12">
          <Link href="/plan">View Plan</Link>
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12"
          onClick={() => { clearSession(); window.location.href = '/' }}
        >
          Start Over
        </Button>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CompleteContent />
    </Suspense>
  )
}
