import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ROOM_LABELS } from '@/types/session'
import { formatPrice } from '@/types/catalog'
import type { RoomType } from '@/types/session'

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params

  const plan = await prisma.plan.findUnique({
    where: { shareToken: token },
    include: {
      items: {
        include: { product: true },
        orderBy: { room: 'asc' },
      },
      session: {
        include: { retailer: true },
      },
    },
  })

  if (!plan) notFound()

  const retailer = plan.session.retailer
  const byRoom = plan.items.reduce<Record<string, typeof plan.items>>((acc, item) => {
    if (!acc[item.room]) acc[item.room] = []
    acc[item.room].push(item)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{retailer.name}</h1>
          <p className="text-muted-foreground">Personalized Room Plan</p>
        </div>

        {/* Style rationale */}
        <div className="rounded-xl border bg-primary/5 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Design Story</h2>
          <p className="text-base leading-relaxed">{plan.styleRationale}</p>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <span className="font-semibold">Estimated Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(plan.totalCents)}</span>
        </div>

        {/* Items by room */}
        {Object.entries(byRoom).map(([room, items]) => (
          <div key={room}>
            <h3 className="mb-3 text-base font-semibold">{ROOM_LABELS[room as RoomType]}</h3>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="relative h-36 bg-muted">
                    <Image
                      src={item.product.thumbnailUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight line-clamp-2">{item.product.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatPrice(item.product.priceUsd)}</p>
                    {item.noteFromAI && (
                      <p className="mt-1 text-xs italic text-muted-foreground line-clamp-2">{item.noteFromAI}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.product.styleIds.slice(0, 1).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Separator />

        {/* CTA */}
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            Visit {retailer.name} to see these pieces in person.
          </p>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Create Your Own Room Plan
          </Link>
        </div>
      </div>
    </main>
  )
}
