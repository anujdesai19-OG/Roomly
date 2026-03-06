import type { RoomType } from '@/types/session'

interface LikedProduct {
  id: string
  name: string
  priceUsd: number
  category: string
  styleIds: string[]
  colorFamily: string[]
}

interface PlanPromptOptions {
  shopperName: string
  designStyle: string
  colorPalette: string[]
  rooms: RoomType[]
  likedByRoom: Record<string, LikedProduct[]>
  budgetCentsByRoom: Record<string, number> | null
  dislikedStyleTags: string[]
}

export function buildPlanPrompt(opts: PlanPromptOptions): string {
  const { shopperName, designStyle, colorPalette, rooms, likedByRoom, budgetCentsByRoom, dislikedStyleTags } = opts

  const roomSections = rooms
    .map((room) => {
      const roomLabel = room.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      const liked = likedByRoom[room] ?? []
      const budget = budgetCentsByRoom?.[room]
      const budgetLabel = budget ? `$${Math.round(budget / 100).toLocaleString()}` : 'no fixed budget'
      const itemLines = liked.map((p) => `  - ID:${p.id} | ${p.name} | $${Math.round(p.priceUsd / 100)} | ${p.category} | styles:${p.styleIds.join(',')}`).join('\n')
      return `### ${roomLabel}\nBudget: ${budgetLabel}\nLiked items:\n${itemLines || '  (none swiped — use best judgment from style profile)'}`
    })
    .join('\n\n')

  return `You are an expert interior designer creating a personalized room furnishing plan.

SHOPPER: ${shopperName}
HOME: 2 bed / 2 bath apartment
DESIGN STYLE: ${designStyle}
COLOR PALETTE: ${colorPalette.join(', ')}
AVOID THESE STYLE ELEMENTS (from disliked items): ${dislikedStyleTags.slice(0, 5).join(', ') || 'none identified'}

ROOMS AND LIKED PRODUCTS:
${roomSections}

OUTPUT: Respond with valid JSON matching this exact schema. No markdown fences, no prose outside the JSON.

{
  "styleRationale": "2-3 sentence explanation of why these selections work together (warm, professional tone, max 60 words)",
  "rooms": [
    {
      "room": "LIVING_ROOM",
      "items": [
        {
          "productId": "...",
          "quantity": 1,
          "noteFromAI": "one sentence role in the room",
          "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
        }
      ],
      "layoutNarrative": "One sentence describing the spatial arrangement"
    }
  ],
  "totalCents": 123400,
  "missingCategories": ["RUG", "FLOOR_LAMP"]
}

RULES:
- Only include items from the liked products lists above
- Use a 12-column × 8-row grid for positions
- If a room has no liked items, select 3-5 style-appropriate items from the "Liked items" section anyway
- missingCategories should list functional gaps (e.g. no lighting) given the room type
- totalCents must equal the sum of all item prices × quantities`
}
