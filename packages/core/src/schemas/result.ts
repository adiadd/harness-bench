import { z } from "zod";

export const ResultMetricsSchema = z.object({
  tokensInput: z.number(),
  tokensOutput: z.number(),
  tokensCacheWrite: z.number().optional(),
  tokensCacheRead: z.number().optional(),
  wallClockMs: z.number(),
  firstTokenMs: z.number().optional(),
  toolCalls: z.number(),
  toolCallsByType: z.record(z.string(), z.number()).optional(),
  turns: z.number(),
  edits: z.number().optional(),
  costUsd: z.number(),
  lintErrors: z.number().optional(),
  typeErrors: z.number().optional(),
  filesChanged: z.number().optional(),
  linesAdded: z.number().optional(),
  linesRemoved: z.number().optional(),
  diffSize: z.number().optional(),
});

export const ResultValidationSchema = z
  .object({
    type: z.string(),
    details: z.record(z.string(), z.any()),
    testsRun: z.number().optional(),
    testsPassed: z.number().optional(),
    testsFailed: z.number().optional(),
  })
  .optional();

export const ResultErrorSchema = z
  .object({
    type: z.string(),
    message: z.string(),
  })
  .optional();

export const ResultSchema = z.object({
  runId: z.string().uuid(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  metrics: ResultMetricsSchema,
  validation: ResultValidationSchema,
  error: ResultErrorSchema,
});

export type Result = z.infer<typeof ResultSchema>;
export type ResultMetrics = z.infer<typeof ResultMetricsSchema>;
