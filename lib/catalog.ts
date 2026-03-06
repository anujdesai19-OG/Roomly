import { prisma } from './db'
import type { RoomType } from '@/types/session'
import type { ProductCategory } from '@/types/catalog'

interface CatalogFilterOptions {
  retailerId: string
  room: RoomType
  maxBudgetCents?: number
  excludeProductIds?: string[]
  limit?: number
}

/**
 * Returns catalog items filtered for a room, within budget, excluding already-seen products.
 * Pre-filtering before sending to Claude reduces token cost and latency.
 */
export async function getFilteredCatalog(opts: CatalogFilterOptions) {
  const { retailerId, room, maxBudgetCents, excludeProductIds = [], limit = 40 } = opts

  const budgetFilter = maxBudgetCents
    ? { priceUsd: { lte: Math.round(maxBudgetCents * 1.2) } } // 20% buffer
    : {}

  return prisma.product.findMany({
    where: {
      retailerId,
      room: { has: room },
      inStock: true,
      id: excludeProductIds.length > 0 ? { notIn: excludeProductIds } : undefined,
      ...budgetFilter,
    },
    take: limit,
    orderBy: { priceUsd: 'asc' },
  })
}

/**
 * Returns catalog items for swaps during refinement:
 * same room, NOT already in the plan, within price range.
 */
export async function getSwapCandidates(opts: {
  retailerId: string
  room: RoomType
  category?: ProductCategory
  maxPriceCents: number
  excludeProductIds: string[]
  limit?: number
}) {
  const { retailerId, room, category, maxPriceCents, excludeProductIds, limit = 20 } = opts

  return prisma.product.findMany({
    where: {
      retailerId,
      room: { has: room },
      category: category ?? undefined,
      inStock: true,
      priceUsd: { lte: Math.round(maxPriceCents * 1.2) },
      id: { notIn: excludeProductIds },
    },
    take: limit,
    orderBy: { priceUsd: 'asc' },
  })
}

/**
 * Returns products by IDs (used to hydrate plan items).
 */
export async function getProductsByIds(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids } },
  })
}
