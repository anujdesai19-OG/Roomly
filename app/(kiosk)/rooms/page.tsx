'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { RoomSelector } from '@/components/kiosk/RoomSelector'
import { useSessionContext } from '@/components/providers/SessionProvider'
import type { RoomType } from '@/types/session'
import { toast } from 'sonner'

export default function RoomsPage() {
  const router = useRouter()
  const { session, updateSession } = useSessionContext()
  const selectedRooms = (session?.selectedRooms ?? []) as RoomType[]

  async function handleContinue() {
    if (selectedRooms.length === 0) return
    if (!session?.id) { router.push('/profile'); return }

    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedRooms, currentStep: 'STYLE' }),
      })
      updateSession({ selectedRooms, currentStep: 'STYLE' })
      router.push('/style')
    } catch {
      toast.error('Failed to save rooms. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="ROOMS" />

      <div>
        {session?.addressMeta ? (
          <>
            <h1 className="text-2xl font-bold">Here are the rooms in your home</h1>
            <p className="mt-1 text-muted-foreground">
              Based on your{' '}
              <span className="font-medium text-foreground">
                {session.addressMeta.beds} bed / {session.addressMeta.baths} bath
              </span>{' '}
              home — add or remove rooms as needed.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Which rooms are you furnishing?</h1>
            <p className="mt-1 text-muted-foreground">Select all that apply. You can always add more later.</p>
          </>
        )}
      </div>

      <RoomSelector
        selected={selectedRooms}
        onChange={(rooms) => updateSession({ selectedRooms: rooms })}
      />

      <Button
        onClick={handleContinue}
        disabled={selectedRooms.length === 0}
        className="w-full h-12 text-base"
      >
        Continue with {selectedRooms.length > 0 ? `${selectedRooms.length} room${selectedRooms.length > 1 ? 's' : ''}` : 'your selection'} →
      </Button>
    </div>
  )
}
