import { type Task } from "@workspace/core/schemas"

export interface ExecutionConfig {
  workspace: string
  model: string
  timeout: number
  env: Record<string, string>
  streaming: boolean
}

export interface ExecutionArtifacts {
  stdout: string
  stderr: string
  transcript?: string
  diff?: string
  filesChanged: string[]
}

export interface ExecutionResult {
  status: "success" | "failure" | "timeout" | "error"
  exitCode: number
  duration: number
  artifacts: ExecutionArtifacts
}

export interface HarnessSetupResult {
  ready: boolean
  version: string
  error?: string
}

export interface HarnessAdapter {
  id: string
  name: string
  setup(): Promise<HarnessSetupResult>
  run(task: Task, config: ExecutionConfig): Promise<ExecutionResult>
  collectMetrics(artifacts: ExecutionArtifacts): Promise<AdapterMetrics>
  teardown?(): Promise<void>
}

export interface AdapterMetrics {
  tokensInput: number
  tokensOutput: number
  tokensCacheWrite?: number
  tokensCacheRead?: number
  toolCalls: number
  toolCallsByType?: Record<string, number>
  turns: number
  costUsd: number
}
