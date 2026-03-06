import type { RoomType } from './session'

export type ProductCategory =
  | 'SOFA'
  | 'ARMCHAIR'
  | 'COFFEE_TABLE'
  | 'SIDE_TABLE'
  | 'DINING_TABLE'
  | 'DINING_CHAIR'
  | 'BED_FRAME'
  | 'DRESSER'
  | 'BOOKSHELF'
  | 'DESK'
  | 'DESK_CHAIR'
  | 'FLOOR_LAMP'
  | 'TABLE_LAMP'
  | 'RUG'
  | 'ARTWORK'
  | 'MIRROR'
  | 'STORAGE'
  | 'ACCENT_PIECE'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  SOFA: 'Sofa',
  ARMCHAIR: 'Armchair',
  COFFEE_TABLE: 'Coffee Table',
  SIDE_TABLE: 'Side Table',
  DINING_TABLE: 'Dining Table',
  DINING_CHAIR: 'Dining Chair',
  BED_FRAME: 'Bed Frame',
  DRESSER: 'Dresser',
  BOOKSHELF: 'Bookshelf',
  DESK: 'Desk',
  DESK_CHAIR: 'Desk Chair',
  FLOOR_LAMP: 'Floor Lamp',
  TABLE_LAMP: 'Table Lamp',
  RUG: 'Rug',
  ARTWORK: 'Artwork',
  MIRROR: 'Mirror',
  STORAGE: 'Storage',
  ACCENT_PIECE: 'Accent Piece',
}

export const CATEGORIES_BY_ROOM: Record<RoomType, ProductCategory[]> = {
  LIVING_ROOM: ['SOFA', 'ARMCHAIR', 'COFFEE_TABLE', 'SIDE_TABLE', 'FLOOR_LAMP', 'RUG', 'ARTWORK', 'ACCENT_PIECE'],
  BEDROOM: ['BED_FRAME', 'DRESSER', 'SIDE_TABLE', 'TABLE_LAMP', 'MIRROR', 'ARTWORK', 'RUG'],
  DINING_ROOM: ['DINING_TABLE', 'DINING_CHAIR', 'STORAGE', 'ARTWORK', 'ACCENT_PIECE'],
  HOME_OFFICE: ['DESK', 'DESK_CHAIR', 'BOOKSHELF', 'FLOOR_LAMP', 'ACCENT_PIECE'],
  NURSERY: ['BED_FRAME', 'DRESSER', 'STORAGE', 'RUG', 'ARTWORK'],
}

export interface ProductDimensions {
  w: number // width in inches
  h: number // height in inches
  d: number // depth in inches
}

export interface Product {
  id: string
  retailerId: string
  sku: string
  name: string
  description: string
  category: ProductCategory
  room: RoomType[]
  priceUsd: number // in cents
  imageUrl: string
  thumbnailUrl: string
  styleIds: string[]
  colorFamily: string[]
  materialTags: string[]
  dimensions: ProductDimensions | null
  inStock: boolean
  createdAt: string
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
