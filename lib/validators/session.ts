import { z } from 'zod'

export const createSessionSchema = z.object({
  retailerId: z.string().min(1),
  shopperName: z.string().min(1).max(100),
  email: z.string().email(),
  address: z.string().min(1).max(500),
  consentGiven: z.literal(true),
})

export const updateSessionSchema = z.object({
  currentStep: z.enum(['PROFILE', 'ROOMS', 'STYLE', 'BUDGET', 'RECOMMENDATIONS', 'PLAN', 'REFINE', 'COMPLETE']).optional(),
  selectedRooms: z.array(z.enum(['LIVING_ROOM', 'BEDROOM', 'DINING_ROOM', 'HOME_OFFICE', 'NURSERY'])).optional(),
  designStyle: z.string().min(1).optional(),
  colorPalette: z.array(z.string()).optional(),
  budgetCents: z.record(z.string(), z.number().int().positive()).optional(),
  addressMeta: z.record(z.string(), z.unknown()).optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
