'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/types/catalog'
import { ROOM_LABELS } from '@/types/session'
import type { PlanItemData } from '@/types/plan'
import type { RoomType } from '@/types/session'

interface ShoppingListProps {
  items: PlanItemData[]
  totalCents: number
}

export function ShoppingList({ items, totalCents }: ShoppingListProps) {
  const byRoom = items.reduce<Record<string, PlanItemData[]>>((acc, item) => {
    const key = item.room
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(byRoom).map(([room, roomItems]) => (
        <div key={room}>
          <h3 className="mb-3 text-base font-semibold text-muted-foreground">
            {ROOM_LABELS[room as RoomType]}
          </h3>
          <div className="space-y-3">
            {roomItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.product.thumbnailUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{item.product.name}</p>
                  {item.noteFromAI && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground line-clamp-1">{item.noteFromAI}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-primary">{formatPrice(item.product.priceUsd)}</span>
                    {item.quantity > 1 && (
                      <Badge variant="secondary">×{item.quantity}</Badge>
                    )}
                  </div>
                </div>
                <a
                  href={`#product-${item.productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${item.product.name} in store`}
                  className="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 touch-manipulation"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Separator />

      <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4">
        <span className="text-base font-semibold">Estimated Total</span>
        <span className="text-2xl font-bold text-primary">{formatPrice(totalCents)}</span>
      </div>
    </div>
  )
}
