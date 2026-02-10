export type {
  Harness,
  HarnessCapabilities,
  Model,
  ModelPricing,
  Suite,
  SuiteCategory,
  Difficulty,
  Task,
  TaskContext,
  TaskValidation,
  ValidationType,
  Run,
  RunStatus,
  RunConfig,
  RunEnvironment,
  Result,
  ResultMetrics,
} from "./schemas/index.js";

export interface DerivedMetrics {
  costEfficiency: number;
  tokenEfficiency: number;
  throughput: number;
  successRate: number;
  consistency: number;
}

export function computeDerivedMetrics(
  scores: number[],
  costs: number[],
  tokens: number[],
  durations: number[],
  passed: boolean[],
): DerivedMetrics {
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
  const avgTokens = tokens.reduce((a, b) => a + b, 0) / tokens.length;
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const passCount = passed.filter(Boolean).length;

  const mean = avgScore;
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;

  return {
    costEfficiency: avgScore > 0 ? avgCost / avgScore : Infinity,
    tokenEfficiency: avgScore > 0 ? avgTokens / avgScore : Infinity,
    throughput: avgDuration > 0 ? avgScore / (avgDuration / 1000) : 0,
    successRate: passCount / passed.length,
    consistency: Math.sqrt(variance),
  };
}
