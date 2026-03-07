'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { PlanView } from '@/components/kiosk/PlanView'
import { RefineChat } from '@/components/kiosk/RefineChat'
import { RecommendedAdditions } from '@/components/kiosk/RecommendedAdditions'
import { LoadingScreen } from '@/components/shared/LoadingSpinner'
import { useSessionContext } from '@/components/providers/SessionProvider'
import type { PlanData } from '@/types/plan'

export default function PlanPage() {
  const router = useRouter()
  const { session } = useSessionContext()

  const [plan, setPlan] = useState<PlanData | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRefine, setShowRefine] = useState(false)

  useEffect(() => {
    if (!session?.id) return
    generatePlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  async function generatePlan() {
    if (!session?.id) return
    setIsStreaming(true)
    setStreamingText('')
    setError(null)

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      })

      if (!res.ok || !res.body) throw new Error('Plan generation failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let planId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk') {
              setStreamingText((t) => t + event.text)
            } else if (event.type === 'done') {
              planId = event.planId
              // Fetch the full plan
              const planRes = await fetch(`/api/plans/${planId}`)
              if (planRes.ok) {
                const { plan: fetchedPlan } = await planRes.json()
                setPlan(fetchedPlan)
              }
            } else if (event.type === 'error') {
              setError(event.message)
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setError('Failed to generate your room plan. Please try again.')
    } finally {
      setIsStreaming(false)
    }
  }

  async function handleRefined(newPlanId: string) {
    const planRes = await fetch(`/api/plans/${newPlanId}`)
    if (planRes.ok) {
      const { plan: updatedPlan } = await planRes.json()
      setPlan(updatedPlan)
    }
    setShowRefine(false)
  }

  if (!session?.id) {
    router.push('/profile')
    return null
  }

  if (!plan && !error) {
    return (
      <div className="space-y-6">
        <StepProgress currentStep="PLAN" />
        <LoadingScreen message={isStreaming && streamingText ? streamingText.slice(0, 80) + '...' : 'Creating your personalized room plan...'} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <StepProgress currentStep="PLAN" />
        <p className="text-red-500">{error}</p>
        <Button onClick={generatePlan} variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="PLAN" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Room Plan</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRefine((v) => !v)}
        >
          {showRefine ? 'Hide Refine' : 'Refine ✏️'}
        </Button>
      </div>

      {showRefine && plan?.id && session?.id && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <RefineChat
            planId={plan.id}
            sessionId={session.id}
            onRefined={handleRefined}
          />
        </div>
      )}

      {plan && (
        <PlanView
          plan={plan}
          styleRationale={isStreaming ? streamingText : undefined}
          isStreaming={isStreaming}
        />
      )}

      {plan?.id && !isStreaming && (
        <RecommendedAdditions planId={plan.id} />
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setShowRefine((v) => !v)} className="flex-1 h-12">
          {showRefine ? 'Hide Refine' : 'Refine Plan ✏️'}
        </Button>
        <Button asChild className="flex-1 h-12">
          <Link href={`/complete?planId=${plan?.id}&sessionId=${session.id}`}>
            Email My Plan →
          </Link>
        </Button>
      </div>
    </div>
  )
}
