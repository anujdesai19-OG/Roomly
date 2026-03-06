'use client'

import { ROOM_LABELS, type RoomType } from '@/types/session'

const ROOM_ICONS: Record<RoomType, string> = {
  LIVING_ROOM: '🛋️',
  BEDROOM: '🛏️',
  DINING_ROOM: '🍽️',
  HOME_OFFICE: '💻',
  NURSERY: '🧸',
}

const ROOM_DESCRIPTIONS: Record<RoomType, string> = {
  LIVING_ROOM: 'Sofas, chairs, tables & more',
  BEDROOM: 'Beds, dressers & nightstands',
  DINING_ROOM: 'Tables, chairs & sideboards',
  HOME_OFFICE: 'Desks, chairs & storage',
  NURSERY: 'Cribs, dressers & decor',
}

const ROOM_DIMENSIONS: Record<RoomType, { sqft: number; w: number; d: number }> = {
  LIVING_ROOM: { sqft: 224, w: 14, d: 16 },
  BEDROOM:     { sqft: 180, w: 12, d: 15 },
  DINING_ROOM: { sqft: 156, w: 12, d: 13 },
  HOME_OFFICE: { sqft: 120, w: 10, d: 12 },
  NURSERY:     { sqft: 110, w: 10, d: 11 },
}

const ALL_ROOMS: RoomType[] = ['LIVING_ROOM', 'BEDROOM', 'DINING_ROOM', 'HOME_OFFICE', 'NURSERY']

interface RoomSelectorProps {
  selected: RoomType[]
  onChange: (rooms: RoomType[]) => void
}

export function RoomSelector({ selected, onChange }: RoomSelectorProps) {
  function toggle(room: RoomType) {
    if (selected.includes(room)) {
      onChange(selected.filter((r) => r !== room))
    } else {
      onChange([...selected, room])
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ALL_ROOMS.map((room) => {
        const isSelected = selected.includes(room)
        return (
          <button
            key={room}
            onClick={() => toggle(room)}
            aria-pressed={isSelected}
            className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all min-h-[80px] touch-manipulation
              ${isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
              }`}
          >
            <span className="text-3xl" aria-hidden="true">{ROOM_ICONS[room]}</span>
            <div className="flex-1">
              <p className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {ROOM_LABELS[room]}
              </p>
              <p className="text-sm text-muted-foreground">{ROOM_DESCRIPTIONS[room]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {ROOM_DIMENSIONS[room].sqft} sq ft · {ROOM_DIMENSIONS[room].w}′ × {ROOM_DIMENSIONS[room].d}′
              </p>
            </div>
            {isSelected && (
              <div className="ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
