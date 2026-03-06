import { z } from 'zod'

export const swipeSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  room: z.enum(['LIVING_ROOM', 'BEDROOM', 'DINING_ROOM', 'HOME_OFFICE', 'NURSERY']),
  direction: z.enum(['LIKE', 'DISLIKE', 'SKIP']),
})

export type SwipeInput = z.infer<typeof swipeSchema>
