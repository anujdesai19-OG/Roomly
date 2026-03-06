import type { RoomType } from './session'
import type { Product } from './catalog'

export interface LayoutPosition {
  x: number // column (0-11 on 12-col grid)
  y: number // row (0-7 on 8-row grid)
  w: number // width in columns
  h: number // height in rows
  [key: string]: unknown // required for Prisma InputJsonValue compatibility
}

export interface PlanItemData {
  id: string
  planId: string
  productId: string
  product: Product
  room: RoomType
  quantity: number
  noteFromAI: string | null
  position: LayoutPosition | null
}

export interface RoomLayout {
  room: RoomType
  items: PlanItemData[]
  layoutNarrative: string
}

export interface RefinementEntry {
  instruction: string
  appliedAt: string
  changesSummary: string
}

export interface PlanData {
  id: string
  sessionId: string
  shareToken: string
  version: number
  styleRationale: string
  layoutJson: RoomLayout[]
  totalCents: number
  refinements: RefinementEntry[]
  emailedAt: string | null
  items: PlanItemData[]
  createdAt: string
  updatedAt: string
}

// Shape Claude must return when generating a plan
export interface ClaudePlanOutput {
  styleRationale: string
  rooms: Array<{
    room: RoomType
    items: Array<{
      productId: string
      quantity: number
      noteFromAI: string
      position: LayoutPosition
    }>
    layoutNarrative: string
  }>
  totalCents: number
  missingCategories: string[]
  changesSummary?: string // only present on refinements
}
