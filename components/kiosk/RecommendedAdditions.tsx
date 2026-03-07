'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/types/catalog'
import type { Product } from '@/types/catalog'

interface RecommendedAdditionsProps {
  planId: string
}

export function RecommendedAdditions({ planId }: RecommendedAdditionsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/plans/${planId}/recommendations`)
      .then((r) => r.json())
      .then(({ recommendations: recs }) => {
        if (Array.isArray(recs)) setRecommendations(recs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [planId])

  if (loading || recommendations.length === 0) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">You might also love</h2>
        <p className="text-sm text-muted-foreground">Style-matched pieces that complement your plan.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {recommendations.map((product) => (
          <div key={product.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="relative h-40 bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 300px"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className="text-xs font-semibold leading-tight line-clamp-2">{product.name}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(product.priceUsd)}</p>
              <p className="text-xs text-muted-foreground capitalize">{product.category.replace(/_/g, ' ').toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
