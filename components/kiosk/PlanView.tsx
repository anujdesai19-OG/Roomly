'use client'

import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingList } from './ShoppingList'
import { StreamingParagraph } from '@/components/shared/StreamingText'
import { ROOM_LABELS } from '@/types/session'
import { formatPrice } from '@/types/catalog'
import type { PlanData } from '@/types/plan'
import type { RoomType } from '@/types/session'
import Image from 'next/image'

// Load Three.js canvas client-side only to avoid SSR issues
const FloorPlan3D = dynamic(
  () => import('./FloorPlan3D').then((m) => m.FloorPlan3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-xl border bg-muted/50">
        <p className="text-sm text-muted-foreground">Loading 3D view…</p>
      </div>
    ),
  },
)

interface PlanViewProps {
  plan: PlanData
  styleRationale?: string
  isStreaming?: boolean
}

export function PlanView({ plan, styleRationale, isStreaming = false }: PlanViewProps) {
  const rooms = [...new Set(plan.items.map((i) => i.room))] as RoomType[]

  return (
    <div className="space-y-6">
      {/* Style rationale */}
      <div className="rounded-xl border bg-primary/5 p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Your Design Direction</h3>
        <StreamingParagraph
          text={styleRationale ?? plan.styleRationale}
          isStreaming={isStreaming}
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Total Estimate</span>
        <span className="text-2xl font-bold text-primary">{formatPrice(plan.totalCents)}</span>
      </div>

      {/* Tabs: one per room (3D + items grid) + shopping list */}
      {rooms.length > 0 && (
        <Tabs defaultValue={`room-${rooms[0]}`}>
          <TabsList className="w-full flex-wrap h-auto gap-1">
            {rooms.map((room) => (
              <TabsTrigger key={room} value={`room-${room}`} className="flex-1 text-xs">
                🏠 {ROOM_LABELS[room]}
              </TabsTrigger>
            ))}
            <TabsTrigger value="shopping-list" className="flex-1 text-xs">
              🛒 Shopping List
            </TabsTrigger>
          </TabsList>

          {/* Per-room: 3D floor plan + item grid below */}
          {rooms.map((room) => {
            const roomItems = plan.items.filter((i) => i.room === room)
            return (
              <TabsContent key={room} value={`room-${room}`} className="mt-4 space-y-5">
                <FloorPlan3D roomType={room} items={roomItems} />
                <RoomGrid room={room} items={roomItems} />
              </TabsContent>
            )
          })}

          {/* Full shopping list */}
          <TabsContent value="shopping-list" className="mt-4">
            <ShoppingList items={plan.items} totalCents={plan.totalCents} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function RoomGrid({ room, items }: { room: RoomType; items: PlanData['items'] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        Items in {ROOM_LABELS[room]}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="relative h-28 bg-muted">
              <Image
                src={item.product.thumbnailUrl}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className="text-xs font-semibold leading-tight line-clamp-2">{item.product.name}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(item.product.priceUsd)}</p>
              {item.noteFromAI && (
                <p className="text-xs italic text-muted-foreground line-clamp-1">{item.noteFromAI}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
