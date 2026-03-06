'use client'

import { Slider } from '@/components/ui/slider'
import { ROOM_LABELS, type RoomType } from '@/types/session'
import { formatPrice } from '@/types/catalog'

const BUDGET_MIN = 50000   // $500
const BUDGET_MAX = 2000000 // $20,000
const BUDGET_STEP = 25000  // $250

interface BudgetSliderProps {
  rooms: RoomType[]
  budgetCents: Record<string, number>
  onChange: (room: RoomType, cents: number) => void
}

export function BudgetSlider({ rooms, budgetCents, onChange }: BudgetSliderProps) {
  return (
    <div className="space-y-8">
      {rooms.map((room) => {
        const value = budgetCents[room] ?? 300000
        return (
          <div key={room}>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-base font-semibold" htmlFor={`budget-${room}`}>
                {ROOM_LABELS[room]}
              </label>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {formatPrice(value)}
              </span>
            </div>
            <Slider
              id={`budget-${room}`}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={[value]}
              onValueChange={([v]) => onChange(room, v)}
              aria-label={`Budget for ${ROOM_LABELS[room]}`}
              className="touch-manipulation"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(BUDGET_MIN)}</span>
              <span>{formatPrice(BUDGET_MAX)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
