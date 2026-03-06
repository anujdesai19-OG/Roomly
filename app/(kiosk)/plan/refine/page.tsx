'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { RefineChat } from '@/components/kiosk/RefineChat'
import { PlanView } from '@/components/kiosk/PlanView'
import { LoadingScreen } from '@/components/shared/LoadingSpinner'
import { useSessionContext } from '@/components/providers/SessionProvider'
import type { PlanData } from '@/types/plan'

export default function RefinePage() {
  const router = useRouter()
  const { session } = useSessionContext()

  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.id) return
    fetchLatestPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  async function fetchLatestPlan() {
    if (!session?.id) return
    try {
      const sessionRes = await fetch(`/api/sessions/${session.id}`)
      const { session: sessionData } = await sessionRes.json()
      const latestPlanId = sessionData?.plans?.[0]?.id

      if (latestPlanId) {
        const planRes = await fetch(`/api/plans/${latestPlanId}`)
        if (planRes.ok) {
          const { plan: fetchedPlan } = await planRes.json()
          setPlan(fetchedPlan)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleRefined(newPlanId: string) {
    const planRes = await fetch(`/api/plans/${newPlanId}`)
    if (planRes.ok) {
      const { plan: updatedPlan } = await planRes.json()
      setPlan(updatedPlan)
    }
  }

  if (!session?.id) { router.push('/profile'); return null }
  if (loading) return <LoadingScreen message="Loading your plan..." />

  return (
    <div className="space-y-6">
      <StepProgress currentStep="REFINE" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Refine Your Plan</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/plan">← Back to Plan</Link>
        </Button>
      </div>

      {plan?.id && session?.id && (
        <RefineChat
          planId={plan.id}
          sessionId={session.id}
          onRefined={handleRefined}
        />
      )}

      {plan && (
        <div className="pt-2">
          <h2 className="mb-4 text-lg font-semibold">Current Plan</h2>
          <PlanView plan={plan} />
        </div>
      )}

      <Button asChild className="w-full h-12 text-base">
        <Link href={`/complete?planId=${plan?.id}&sessionId=${session.id}`}>
          Email My Plan →
        </Link>
      </Button>
    </div>
  )
}
