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
    <nav aria-label="Progress" className="w-full pb-6 border-b" style={{ borderColor: '#C2B39F' }}>
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <li key={step.key} className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-6 w-6 items-center justify-center text-xs transition-colors"
                style={{
                  background: isCompleted ? '#06060b' : isCurrent ? '#333333' : 'transparent',
                  color: isCompleted || isCurrent ? '#FFFFFF' : '#C2B39F',
                  border: `1px solid ${isCompleted ? '#06060b' : isCurrent ? '#333333' : '#C2B39F'}`,
                }}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: 'var(--font-inter)' }}>{index + 1}</span>
                )}
              </div>
              <span
                className="text-xs uppercase tracking-wide"
                style={{
                  color: isCurrent ? '#333333' : '#5c5c5c',
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.08em',
                  fontSize: '0.6rem',
                }}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
