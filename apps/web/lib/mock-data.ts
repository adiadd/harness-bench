export type Harness = {
  id: string
  slug: string
  name: string
  provider: string
  capabilities: string[]
  description: string
}

export type Model = {
  id: string
  name: string
  provider: string
  inputPricePerMTok: number
  outputPricePerMTok: number
}

export type LeaderboardEntry = {
  harness: string
  model: string
  score: number
  passRate: number
  avgCost: number
  runs: number
}

export type RunMetrics = {
  costUsd: number
  wallClockMs: number
  tokensInput: number
  tokensOutput: number
  toolCalls: number
  turns: number
}

export type RunResult = {
  score: number
  passed: boolean
  metrics: RunMetrics
}

export type Run = {
  id: string
  harnessId: string
  modelId: string
  taskId: string
  harness: string
  model: string
  task: string
  score: number
  cost: number
  duration: number
  status: "passed" | "failed" | "error"
  result: RunResult
  createdAt: string
}

export type TaskContext = {
  language: string
  framework?: string
  files?: string[]
}

export type TaskValidation = {
  type: string
  testCommand?: string
  passingScore?: number
}

export type Task = {
  id: string
  suiteId: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  description: string
  context: TaskContext
  validation: TaskValidation
  tags: string[]
}

export const mockHarnesses: Harness[] = [
  {
    id: "claude-code",
    slug: "claude-code",
    name: "Claude Code",
    provider: "Anthropic",
    capabilities: ["file-editing", "terminal", "browser", "multi-file"],
    description: "Anthropic's agentic coding CLI with full project context",
  },
  {
    id: "aider",
    slug: "aider",
    name: "Aider",
    provider: "Paul Gauthier",
    capabilities: ["file-editing", "terminal", "git-integration"],
    description: "AI pair programming in your terminal with git awareness",
  },
  {
    id: "kiro",
    slug: "kiro",
    name: "Kiro",
    provider: "Amazon",
    capabilities: ["file-editing", "terminal", "spec-driven"],
    description: "Spec-driven AI IDE with structured development workflows",
  },
]

export const mockModels: Model[] = [
  {
    id: "opus-4-6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    inputPricePerMTok: 15,
    outputPricePerMTok: 75,
  },
  {
    id: "sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    inputPricePerMTok: 2.5,
    outputPricePerMTok: 10,
  },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    harness: "Claude Code",
    model: "Opus 4.6",
    score: 0.924,
    passRate: 0.94,
    avgCost: 0.87,
    runs: 150,
  },
  {
    harness: "Claude Code",
    model: "Sonnet 4.5",
    score: 0.851,
    passRate: 0.887,
    avgCost: 0.32,
    runs: 150,
  },
  {
    harness: "Aider",
    model: "Opus 4.6",
    score: 0.786,
    passRate: 0.817,
    avgCost: 0.95,
    runs: 120,
  },
  {
    harness: "Aider",
    model: "Sonnet 4.5",
    score: 0.723,
    passRate: 0.75,
    avgCost: 0.38,
    runs: 120,
  },
  {
    harness: "Kiro",
    model: "GPT-4o",
    score: 0.689,
    passRate: 0.711,
    avgCost: 0.29,
    runs: 90,
  },
  {
    harness: "Claude Code",
    model: "GPT-4o",
    score: 0.742,
    passRate: 0.78,
    avgCost: 0.25,
    runs: 100,
  },
]

export const mockRuns: Run[] = [
  {
    id: "run-001",
    harnessId: "claude-code",
    modelId: "opus-4-6",
    taskId: "ts-generic-pick",
    harness: "Claude Code",
    model: "Opus 4.6",
    task: "Implement Generic Pick",
    score: 100,
    cost: 0.92,
    duration: 42.3,
    status: "passed",
    result: {
      score: 100,
      passed: true,
      metrics: { costUsd: 0.9234, wallClockMs: 42300, tokensInput: 12400, tokensOutput: 3200, toolCalls: 4, turns: 3 },
    },
    createdAt: "2026-02-08T14:23:00Z",
  },
  {
    id: "run-002",
    harnessId: "claude-code",
    modelId: "sonnet-4-5",
    taskId: "ts-readonly-deep",
    harness: "Claude Code",
    model: "Sonnet 4.5",
    task: "Deep Readonly",
    score: 85,
    cost: 0.28,
    duration: 36.1,
    status: "passed",
    result: {
      score: 85,
      passed: true,
      metrics: { costUsd: 0.2812, wallClockMs: 36100, tokensInput: 9800, tokensOutput: 2600, toolCalls: 3, turns: 2 },
    },
    createdAt: "2026-02-08T14:45:00Z",
  },
  {
    id: "run-003",
    harnessId: "aider",
    modelId: "opus-4-6",
    taskId: "py-async-queue",
    harness: "Aider",
    model: "Opus 4.6",
    task: "Async Task Queue",
    score: 35,
    cost: 1.04,
    duration: 58.2,
    status: "failed",
    result: {
      score: 35,
      passed: false,
      metrics: { costUsd: 1.0423, wallClockMs: 58200, tokensInput: 15600, tokensOutput: 4100, toolCalls: 6, turns: 5 },
    },
    createdAt: "2026-02-08T15:02:00Z",
  },
  {
    id: "run-004",
    harnessId: "kiro",
    modelId: "gpt-4o",
    taskId: "py-decorator-retry",
    harness: "Kiro",
    model: "GPT-4o",
    task: "Retry Decorator",
    score: 72,
    cost: 0.31,
    duration: 29.8,
    status: "passed",
    result: {
      score: 72,
      passed: true,
      metrics: { costUsd: 0.3102, wallClockMs: 29800, tokensInput: 8200, tokensOutput: 2100, toolCalls: 3, turns: 2 },
    },
    createdAt: "2026-02-08T15:18:00Z",
  },
  {
    id: "run-005",
    harnessId: "claude-code",
    modelId: "opus-4-6",
    taskId: "ts-type-guard",
    harness: "Claude Code",
    model: "Opus 4.6",
    task: "Runtime Type Guard",
    score: 40,
    cost: 0.78,
    duration: 51.4,
    status: "failed",
    result: {
      score: 40,
      passed: false,
      metrics: { costUsd: 0.7801, wallClockMs: 51400, tokensInput: 18200, tokensOutput: 5800, toolCalls: 8, turns: 6 },
    },
    createdAt: "2026-02-08T15:35:00Z",
  },
]

export const mockTasks: Task[] = [
  {
    id: "ts-generic-pick",
    suiteId: "typescript-challenges",
    title: "Implement Generic Pick",
    difficulty: "easy",
    description: "Implement a type-level Pick utility without using the built-in Pick generic",
    context: { language: "typescript", files: ["pick.ts", "pick.test.ts"] },
    validation: { type: "test-runner", testCommand: "bun test", passingScore: 80 },
    tags: ["generics", "utility-types"],
  },
  {
    id: "ts-readonly-deep",
    suiteId: "typescript-challenges",
    title: "Deep Readonly",
    difficulty: "medium",
    description: "Implement a generic DeepReadonly that makes all properties of an object readonly recursively",
    context: { language: "typescript", files: ["deep-readonly.ts", "deep-readonly.test.ts"] },
    validation: { type: "test-runner", testCommand: "bun test", passingScore: 80 },
    tags: ["generics", "recursion"],
  },
  {
    id: "ts-type-guard",
    suiteId: "typescript-challenges",
    title: "Runtime Type Guard",
    difficulty: "hard",
    description: "Create a type-safe runtime validator that infers TypeScript types from a schema definition",
    context: { language: "typescript", framework: "zod-like", files: ["validator.ts", "validator.test.ts"] },
    validation: { type: "test-runner", testCommand: "bun test", passingScore: 90 },
    tags: ["type-guards", "inference", "runtime"],
  },
  {
    id: "py-async-queue",
    suiteId: "python-challenges",
    title: "Async Task Queue",
    difficulty: "medium",
    description: "Implement an async task queue with concurrency limits and priority ordering",
    context: { language: "python", framework: "asyncio", files: ["queue.py", "test_queue.py"] },
    validation: { type: "test-runner", testCommand: "pytest", passingScore: 80 },
    tags: ["async", "concurrency"],
  },
  {
    id: "py-decorator-retry",
    suiteId: "python-challenges",
    title: "Retry Decorator",
    difficulty: "easy",
    description: "Create a configurable retry decorator with exponential backoff and jitter",
    context: { language: "python", files: ["retry.py", "test_retry.py"] },
    validation: { type: "test-runner", testCommand: "pytest", passingScore: 80 },
    tags: ["decorators", "error-handling"],
  },
]
