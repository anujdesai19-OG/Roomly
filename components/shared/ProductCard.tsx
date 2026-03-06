import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/types/catalog'
import type { Product } from '@/types/catalog'

interface ProductCardProps {
  product: Product
  noteFromAI?: string | null
  compact?: boolean
}

export function ProductCard({ product, noteFromAI, compact = false }: ProductCardProps) {
  return (
    <div className={`flex gap-3 ${compact ? '' : 'p-3 rounded-lg border bg-card'}`}>
      <div className={`relative flex-shrink-0 rounded-md overflow-hidden bg-muted ${compact ? 'h-16 w-16' : 'h-24 w-24'}`}>
        <Image
          src={product.thumbnailUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes={compact ? '64px' : '96px'}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <p className={`font-medium leading-tight ${compact ? 'text-sm' : 'text-base'} truncate`}>{product.name}</p>
        <p className={`font-semibold text-primary ${compact ? 'text-sm' : 'text-base'}`}>{formatPrice(product.priceUsd)}</p>
        {noteFromAI && !compact && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">{noteFromAI}</p>
        )}
        {!compact && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.styleIds.slice(0, 2).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
