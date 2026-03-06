import type { RoomType } from '@/types/session'

interface CatalogItem {
  id: string
  name: string
  priceUsd: number
  styleIds: string[]
  colorFamily: string[]
  category: string
}

interface RecommendationPromptOptions {
  room: RoomType
  designStyle: string
  colorPalette: string[]
  budgetCents: number | null
  catalog: CatalogItem[]
}

export function buildRecommendationPrompt(opts: RecommendationPromptOptions): string {
  const { room, designStyle, colorPalette, budgetCents, catalog } = opts
  const roomLabel = room.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  const budgetLabel = budgetCents ? `$${Math.round(budgetCents / 100).toLocaleString()}` : 'no fixed budget'

  const catalogLines = catalog
    .map((p) => `ID:${p.id}|${p.name}|$${Math.round(p.priceUsd / 100)}|style:${p.styleIds.join(',')}|color:${p.colorFamily.join(',')}|${p.category}`)
    .join('\n')

  return `You are a professional interior designer helping a shopper furnish their ${roomLabel}.

SHOPPER STYLE PROFILE:
- Design style: ${designStyle}
- Color palette: ${colorPalette.join(', ')}
- Budget for this room: ${budgetLabel}
- Home: 2-bedroom, 2-bathroom apartment

AVAILABLE PRODUCTS (${catalog.length} items, pre-filtered for this room and budget):
${catalogLines}

TASK: Rank ALL these products from most to least suitable for this shopper's ${roomLabel}.
Consider: style alignment with "${designStyle}", color harmony with the palette, budget fit, and variety across furniture types.

Return ONLY a valid JSON array of product IDs in ranked order. No other text, no markdown fences.
Example: ["id1","id2","id3"]`
}
