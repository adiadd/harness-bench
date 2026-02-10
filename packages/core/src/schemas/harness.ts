import { z } from "zod";

export const HarnessCapabilitiesSchema = z.object({
  streaming: z.boolean(),
  multifile: z.boolean(),
  codeExecution: z.boolean(),
  webSearch: z.boolean(),
  shellAccess: z.boolean(),
});

export const HarnessSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  provider: z.string(),
  executor: z.enum(["cli", "api", "docker", "manual"]),
  command: z.string().optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  capabilities: HarnessCapabilitiesSchema,
});

export type Harness = z.infer<typeof HarnessSchema>;
export type HarnessCapabilities = z.infer<typeof HarnessCapabilitiesSchema>;
