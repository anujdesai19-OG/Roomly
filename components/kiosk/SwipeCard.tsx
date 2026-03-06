'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/types/catalog'
import type { Product } from '@/types/catalog'

interface SwipeCardProps {
  product: Product
  style?: React.CSSProperties
  className?: string
}

export function SwipeCard({ product, style, className = '' }: SwipeCardProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-xl ${className}`}
      style={style}
    >
      {/* Product image */}
      <div className="relative h-72 w-full bg-muted sm:h-80">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 480px"
          priority
        />
      </div>

      {/* Product details */}
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold leading-tight">{product.name}</h2>
          <span className="flex-shrink-0 text-xl font-bold text-primary">{formatPrice(product.priceUsd)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.styleIds.map((s) => (
            <Badge key={s} variant="secondary" className="capitalize">{s.replace('-', ' ')}</Badge>
          ))}
          {product.colorFamily.slice(0, 2).map((c) => (
            <Badge key={c} variant="outline" className="capitalize">{c.replace('-', ' ')}</Badge>
          ))}
        </div>
        {product.dimensions && (
          <p className="text-xs text-muted-foreground">
            {`${product.dimensions.w}"W × ${product.dimensions.d}"D × ${product.dimensions.h}"H`}
          </p>
        )}
      </div>
    </div>
  )
}
