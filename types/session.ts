export type RoomType = 'LIVING_ROOM' | 'BEDROOM' | 'DINING_ROOM' | 'HOME_OFFICE' | 'NURSERY'

export type StepName =
  | 'PROFILE'
  | 'ROOMS'
  | 'STYLE'
  | 'BUDGET'
  | 'RECOMMENDATIONS'
  | 'PLAN'
  | 'REFINE'
  | 'COMPLETE'

export type SwipeDirection = 'LIKE' | 'DISLIKE' | 'SKIP'

export const ROOM_LABELS: Record<RoomType, string> = {
  LIVING_ROOM: 'Living Room',
  BEDROOM: 'Bedroom',
  DINING_ROOM: 'Dining Room',
  HOME_OFFICE: 'Home Office',
  NURSERY: 'Nursery',
}

export const ROOM_SLUGS: Record<RoomType, string> = {
  LIVING_ROOM: 'living-room',
  BEDROOM: 'bedroom',
  DINING_ROOM: 'dining-room',
  HOME_OFFICE: 'home-office',
  NURSERY: 'nursery',
}

export const SLUG_TO_ROOM: Record<string, RoomType> = {
  'living-room': 'LIVING_ROOM',
  bedroom: 'BEDROOM',
  'dining-room': 'DINING_ROOM',
  'home-office': 'HOME_OFFICE',
  nursery: 'NURSERY',
}

export const DESIGN_STYLES = [
  { id: 'modern',       label: 'Modern',       emoji: '🏙️', description: 'Clean lines, minimal clutter, function-first spaces' },
  { id: 'scandinavian', label: 'Scandinavian', emoji: '🌿', description: 'Light woods, cozy textures, calm and understated' },
  { id: 'bohemian',     label: 'Bohemian',     emoji: '🪴', description: 'Layered textiles, plants, eclectic global touches' },
  { id: 'traditional',  label: 'Traditional',  emoji: '🏛️', description: 'Classic silhouettes, warm tones, timeless symmetry' },
  { id: 'industrial',   label: 'Industrial',   emoji: '🔩', description: 'Raw materials, metal accents, urban loft character' },
  { id: 'mid-century',  label: 'Mid-Century',  emoji: '📺', description: 'Tapered legs, organic curves, retro-modern palette' },
  { id: 'coastal',      label: 'Coastal',      emoji: '🐚', description: 'Breezy whites, natural rattan, sea-inspired calm' },
  { id: 'japandi',      label: 'Japandi',      emoji: '🍃', description: 'Wabi-sabi simplicity, natural wood, quiet harmony' },
] as const

export const COLOR_PALETTES = [
  { id: 'neutral', label: 'Neutrals', description: 'Whites, creams, beiges', hex: '#f5f0eb' },
  { id: 'warm', label: 'Warm Tones', description: 'Terracotta, amber, rust', hex: '#c27c4a' },
  { id: 'cool', label: 'Cool Tones', description: 'Blues, greens, greys', hex: '#6b8fa3' },
  { id: 'bold', label: 'Bold & Contrasting', description: 'Deep navy, forest green, black', hex: '#1e3a5f' },
  { id: 'monochromatic', label: 'Monochromatic', description: 'One hue in varied tones', hex: '#8a9bb0' },
  { id: 'earthy', label: 'Earthy & Natural', description: 'Browns, greens, taupes', hex: '#7d6a54' },
] as const

export interface AddressMeta {
  beds: number
  baths: number
  estimatedSqft: number | null
  rooms: RoomType[]
  source: 'stub' | 'api'
}

export interface BudgetCents {
  [room: string]: number
}

export interface SessionState {
  id: string
  retailerId: string
  shopperName: string | null
  email: string | null
  address: string | null
  addressMeta: AddressMeta | null
  consentGiven: boolean
  selectedRooms: RoomType[]
  designStyle: string | null
  colorPalette: string[]
  budgetCents: BudgetCents | null
  currentStep: StepName
  resumeToken: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
