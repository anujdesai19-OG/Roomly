'use client'

import type { StepName } from '@/types/session'

const STEPS: { key: StepName; label: string }[] = [
  { key: 'PROFILE', label: 'You' },
  { key: 'ROOMS', label: 'Rooms' },
  { key: 'STYLE', label: 'Style' },
  { key: 'BUDGET', label: 'Budget' },
  { key: 'RECOMMENDATIONS', label: 'Browse' },
  { key: 'PLAN', label: 'Plan' },
]

const STEP_ORDER = STEPS.map((s) => s.key)

interface StepProgressProps {
  currentStep: StepName
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep)

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <li key={step.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors
                  ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                  ${isCurrent ? 'bg-primary/20 text-primary ring-2 ring-primary' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
