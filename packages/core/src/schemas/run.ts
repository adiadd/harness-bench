import { z } from "zod";

export const RunStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "timeout",
]);

export const RunConfigSchema = z
  .object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    customFlags: z.record(z.string(), z.any()).optional(),
  })
  .optional();

export const RunEnvironmentSchema = z.object({
  os: z.string(),
  arch: z.string(),
});

export const RunSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string(),
  harnessId: z.string(),
  modelId: z.string(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  durationMs: z.number().optional(),
  config: RunConfigSchema,
  environment: RunEnvironmentSchema,
  status: RunStatusSchema,
  submittedBy: z.string().optional(),
});

export type Run = z.infer<typeof RunSchema>;
export type RunStatus = z.infer<typeof RunStatusSchema>;
export type RunConfig = z.infer<typeof RunConfigSchema>;
export type RunEnvironment = z.infer<typeof RunEnvironmentSchema>;
