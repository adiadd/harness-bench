import { z } from "zod"

export const ModelPricingSchema = z.object({
  inputPerMillion: z.number(),
  outputPerMillion: z.number(),
  cacheWritePerMillion: z.number().optional(),
  cacheReadPerMillion: z.number().optional(),
})

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(["anthropic", "openai", "google", "other"]),
  family: z.string(),
  pricing: ModelPricingSchema,
  contextWindow: z.number(),
  maxOutput: z.number(),
})

export type Model = z.infer<typeof ModelSchema>
export type ModelPricing = z.infer<typeof ModelPricingSchema>
