'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { BudgetSlider } from '@/components/kiosk/BudgetSlider'
import { useSessionContext } from '@/components/providers/SessionProvider'
import type { RoomType } from '@/types/session'
import { toast } from 'sonner'

const DEFAULT_BUDGET = 300000 // $3,000

export default function BudgetPage() {
  const router = useRouter()
  const { session, updateSession } = useSessionContext()

  const rooms = (session?.selectedRooms ?? []) as RoomType[]
  const budgetCents = (session?.budgetCents ?? {}) as Record<string, number>

  // Initialize defaults for any rooms without a budget
  const budgetWithDefaults = rooms.reduce<Record<string, number>>((acc, room) => {
    acc[room] = budgetCents[room] ?? DEFAULT_BUDGET
    return acc
  }, {})

  function handleBudgetChange(room: RoomType, cents: number) {
    updateSession({ budgetCents: { ...budgetWithDefaults, [room]: cents } })
  }

  async function handleContinue() {
    if (!session?.id) { router.push('/profile'); return }

    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetCents: budgetWithDefaults, currentStep: 'RECOMMENDATIONS' }),
      })
      updateSession({ budgetCents: budgetWithDefaults, currentStep: 'RECOMMENDATIONS' })
      router.push('/recommendations')
    } catch {
      toast.error('Failed to save budget. Please try again.')
    }
  }

  if (rooms.length === 0) {
    router.push('/rooms')
    return null
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="BUDGET" />

      <div>
        <h1 className="text-2xl font-bold">What&apos;s your budget?</h1>
        <p className="mt-1 text-muted-foreground">Set a budget per room. We&apos;ll keep recommendations within range.</p>
      </div>

      <BudgetSlider
        rooms={rooms}
        budgetCents={budgetWithDefaults}
        onChange={handleBudgetChange}
      />

      <Button onClick={handleContinue} className="w-full h-12 text-base">
        Browse Furniture →
      </Button>
    </div>
  )
}
