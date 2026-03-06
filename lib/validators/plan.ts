import { z } from 'zod'

export const generatePlanSchema = z.object({
  sessionId: z.string().min(1),
})

export const refinePlanSchema = z.object({
  sessionId: z.string().min(1),
  instruction: z.string().min(1).max(500),
})

export const sendEmailSchema = z.object({
  sessionId: z.string().min(1),
  planId: z.string().min(1),
})

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>
export type RefinePlanInput = z.infer<typeof refinePlanSchema>
export type SendEmailInput = z.infer<typeof sendEmailSchema>
