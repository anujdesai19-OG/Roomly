'use client'

interface LikeDislikeBarProps {
  onLike: () => void
  onDislike: () => void
  onSkip?: () => void
  disabled?: boolean
}

export function LikeDislikeBar({ onLike, onDislike, onSkip, disabled = false }: LikeDislikeBarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Dislike */}
      <button
        onClick={onDislike}
        disabled={disabled}
        aria-label="Dislike this item"
        className="flex h-16 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-500 transition-all touch-manipulation hover:bg-red-100 active:scale-95 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="font-semibold text-base">Nope</span>
      </button>

      {/* Skip */}
      {onSkip && (
        <button
          onClick={onSkip}
          disabled={disabled}
          aria-label="Skip this item"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground transition-all touch-manipulation hover:bg-muted active:scale-95 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        aria-label="Like this item"
        className="flex h-16 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 text-green-600 transition-all touch-manipulation hover:bg-green-100 active:scale-95 disabled:opacity-50 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="font-semibold text-base">Love it</span>
      </button>
    </div>
  )
}
