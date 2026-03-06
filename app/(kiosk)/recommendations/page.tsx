'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StepProgress } from '@/components/kiosk/StepProgress'
import { SwipeDeck } from '@/components/kiosk/SwipeDeck'
import { LoadingScreen } from '@/components/shared/LoadingSpinner'
import { useSessionContext } from '@/components/providers/SessionProvider'
import { ROOM_LABELS, type RoomType } from '@/types/session'
import type { Product } from '@/types/catalog'

export default function RecommendationsPage() {
  const router = useRouter()
  const { session, updateSession } = useSessionContext()
  const rooms = useMemo(
    () => (session?.selectedRooms ?? []) as RoomType[],
    [session?.selectedRooms],
  )

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [roomIndex, setRoomIndex] = useState(0)

  const currentRoom = rooms[roomIndex]

  useEffect(() => {
    if (!session?.id || !currentRoom) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setProducts([])

    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, room: currentRoom }),
    }).then(async (res) => {
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const collected: Product[] = []
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'product') {
              collected.push(data.product)
              setProducts([...collected])
              if (collected.length === 1) setLoading(false)
            } else if (data.type === 'done' || data.type === 'error') {
              setLoading(false)
            }
          } catch { /* ignore */ }
        }
      }
    }).catch(() => setLoading(false))
  }, [session?.id, currentRoom])

  function handleEnoughLikes() {
    if (roomIndex < rooms.length - 1) {
      setRoomIndex(roomIndex + 1)
    } else {
      updateSession({ currentStep: 'PLAN' })
      router.push('/plan')
    }
  }

  if (!session?.id) {
    router.push('/profile')
    return null
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <StepProgress currentStep="RECOMMENDATIONS" />
        <LoadingScreen message="Finding furniture that matches your style..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepProgress currentStep="RECOMMENDATIONS" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{ROOM_LABELS[currentRoom]}</h1>
          <p className="text-sm text-muted-foreground">
            {rooms.length > 1 && `Room ${roomIndex + 1} of ${rooms.length} · `}
            Swipe to find your favorites
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleEnoughLikes}>
          {roomIndex < rooms.length - 1 ? 'Next Room →' : 'See Plan →'}
        </Button>
      </div>

      {products.length > 0 ? (
        <SwipeDeck
          sessionId={session.id}
          room={currentRoom}
          initialProducts={products}
          onEnoughLikes={handleEnoughLikes}
        />
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-muted/50">
          <p className="text-muted-foreground">No products found for this room and budget.</p>
        </div>
      )}
    </div>
  )
}
