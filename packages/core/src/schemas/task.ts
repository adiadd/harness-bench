import { z } from "zod";
import { DifficultySchema } from "./suite.js";

export const ValidationTypeSchema = z.enum([
  "test-suite",
  "diff-match",
  "llm-judge",
  "manual",
  "hybrid",
]);

export const TaskContextSchema = z.object({
  repoUrl: z.string().url().optional(),
  repoCommit: z.string().optional(),
  repoSnapshot: z.string().optional(),
  files: z.record(z.string(), z.string()).optional(),
  language: z.string(),
  framework: z.array(z.string()).optional(),
  requiredTools: z.array(z.string()).optional(),
});

export const TaskValidationSchema = z.object({
  type: ValidationTypeSchema,
  testCommand: z.string().optional(),
  testFiles: z.array(z.string()).optional(),
  expectedFiles: z.record(z.string(), z.string()).optional(),
  judgePrompt: z.string().optional(),
  maxScore: z.number().default(100),
  passingScore: z.number().default(70),
});

export const TaskSchema = z.object({
  id: z.string(),
  suiteId: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().optional(),
  context: TaskContextSchema,
  prompt: z.string(),
  validation: TaskValidationSchema,
  author: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskContext = z.infer<typeof TaskContextSchema>;
export type TaskValidation = z.infer<typeof TaskValidationSchema>;
export type ValidationType = z.infer<typeof ValidationTypeSchema>;
