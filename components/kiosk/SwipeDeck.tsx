'use client'

import { useState, useCallback, useEffect } from 'react'
import { SwipeCard } from './SwipeCard'
import { LikeDislikeBar } from './LikeDislikeBar'
import type { Product } from '@/types/catalog'
import type { RoomType } from '@/types/session'

interface SwipeDeckProps {
  sessionId: string
  room: RoomType
  initialProducts: Product[]
  onEnoughLikes?: (likeCount: number) => void
  minLikesRequired?: number
}

const MIN_LIKES_TO_PROCEED = 3

export function SwipeDeck({ sessionId, room, initialProducts, onEnoughLikes, minLikesRequired = MIN_LIKES_TO_PROCEED }: SwipeDeckProps) {
  const [queue] = useState<Product[]>(initialProducts)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [totalSeen, setTotalSeen] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [animating, setAnimating] = useState<'like' | 'dislike' | null>(null)

  const currentProduct = queue[currentIndex]
  const isExhausted = currentIndex >= queue.length

  const recordSwipe = useCallback(async (productId: string, direction: 'LIKE' | 'DISLIKE' | 'SKIP') => {
    try {
      await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId, room, direction }),
      })
    } catch {
      // Non-blocking — swipe signal is best-effort
    }
  }, [sessionId, room])

  const handleSwipe = useCallback(async (direction: 'LIKE' | 'DISLIKE' | 'SKIP') => {
    if (!currentProduct || isRecording) return

    setIsRecording(true)
    setAnimating(direction === 'LIKE' ? 'like' : 'dislike')

    await recordSwipe(currentProduct.id, direction)

    const newLikes = direction === 'LIKE' ? likeCount + 1 : likeCount
    setLikeCount(newLikes)
    setTotalSeen((n) => n + 1)

    setTimeout(() => {
      setCurrentIndex((i) => i + 1)
      setAnimating(null)
      setIsRecording(false)

      if (newLikes >= minLikesRequired && onEnoughLikes) {
        onEnoughLikes(newLikes)
      }
    }, 300)
  }, [currentProduct, isRecording, likeCount, minLikesRequired, onEnoughLikes, recordSwipe])

  // Keyboard support — declared after handleSwipe so the ref is stable
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') handleSwipe('LIKE')
      if (e.key === 'ArrowLeft') handleSwipe('DISLIKE')
      if (e.key === 'ArrowDown') handleSwipe('SKIP')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleSwipe])

  if (isExhausted) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl">✨</div>
        <h3 className="text-xl font-bold">You reviewed {totalSeen} items</h3>
        <p className="text-muted-foreground">
          {likeCount > 0
            ? `You loved ${likeCount} piece${likeCount === 1 ? '' : 's'}. Ready to see your room plan!`
            : "No favorites yet — try adjusting your style or browse more."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalSeen} reviewed</span>
        <span className="font-medium text-primary">{likeCount} loved ❤️</span>
      </div>

      {/* Card stack */}
      <div className="relative">
        {/* Ghost cards for depth effect */}
        {queue[currentIndex + 2] && (
          <div className="absolute inset-x-0 top-2 mx-4 rounded-2xl bg-muted/60 opacity-40" style={{ height: '100%' }} />
        )}
        {queue[currentIndex + 1] && (
          <div className="absolute inset-x-0 top-1 mx-2 rounded-2xl bg-muted/80 opacity-70" style={{ height: '100%' }} />
        )}
        <SwipeCard
          product={currentProduct}
          className={`relative transition-transform duration-300 ${
            animating === 'like' ? 'translate-x-16 rotate-6 opacity-0' :
            animating === 'dislike' ? '-translate-x-16 -rotate-6 opacity-0' : ''
          }`}
        />
      </div>

      {/* Action buttons */}
      <LikeDislikeBar
        onLike={() => handleSwipe('LIKE')}
        onDislike={() => handleSwipe('DISLIKE')}
        onSkip={() => handleSwipe('SKIP')}
        disabled={isRecording}
      />

      {likeCount >= minLikesRequired && (
        <p className="text-center text-sm text-muted-foreground">
          Keep browsing or{' '}
          <button
            onClick={() => onEnoughLikes?.(likeCount)}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            generate your plan now
          </button>
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">← dislike · like → · ↓ skip</p>
    </div>
  )
}
