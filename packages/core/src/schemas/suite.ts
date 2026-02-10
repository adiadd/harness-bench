import { z } from "zod"

export const SuiteCategorySchema = z.enum([
  "bug-fix",
  "feature-add",
  "refactor",
  "optimization",
  "test-writing",
  "docs",
  "mixed",
])

export const DifficultySchema = z.enum(["easy", "medium", "hard", "expert"])

export const SuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: SuiteCategorySchema,
  difficulty: DifficultySchema,
  author: z.string(),
  tags: z.array(z.string()),
  taskIds: z.array(z.string()),
  version: z.string(),
})

export type Suite = z.infer<typeof SuiteSchema>
export type SuiteCategory = z.infer<typeof SuiteCategorySchema>
export type Difficulty = z.infer<typeof DifficultySchema>
