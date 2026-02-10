import os from "node:os"
import fs from "node:fs"
import path from "node:path"
import { v4 as uuid } from "uuid"
import { type Task, type Run, type Result } from "@workspace/core/schemas"
import { BenchDB } from "@workspace/core/db"
import { getAdapter } from "@workspace/adapters/registry"
import { type ExecutionConfig } from "@workspace/adapters/types"
import { createWorkspace, getChangedFiles, getDiffOutput, getDiffStats } from "./isolation.js"
import { grade } from "./grader.js"

export interface RunPlan {
  tasks: Task[]
  harnessIds: string[]
  modelId: string
  timeout: number
  env: Record<string, string>
}

export interface RunProgress {
  total: number
  completed: number
  current?: {
    taskId: string
    harnessId: string
  }
}

export type ProgressCallback = (progress: RunProgress) => void

export async function execute(
  plan: RunPlan,
  db: BenchDB,
  artifactsDir: string,
  onProgress?: ProgressCallback
): Promise<Array<{ run: Run; result: Result }>> {
  const results: Array<{ run: Run; result: Result }> = []
  const combos: Array<{ task: Task; harnessId: string }> = []

  for (const task of plan.tasks) {
    for (const harnessId of plan.harnessIds) {
      combos.push({ task, harnessId })
    }
  }

  const total = combos.length
  let completed = 0

  for (const { task, harnessId } of combos) {
    onProgress?.({ total, completed, current: { taskId: task.id, harnessId } })

    const adapter = getAdapter(harnessId)
    const setup = await adapter.setup()

    if (!setup.ready) {
      console.error(`Harness ${harnessId} not ready: ${setup.error}`)
      completed++
      continue
    }

    const runId = uuid()
    const run: Run = {
      id: runId,
      taskId: task.id,
      harnessId,
      modelId: plan.modelId,
      startedAt: new Date(),
      status: "running",
      environment: { os: os.platform(), arch: os.arch() },
    }

    db.insertRun(run)

    const workspace = createWorkspace(task, runId)
    const config: ExecutionConfig = {
      workspace: workspace.path,
      model: plan.modelId,
      timeout: plan.timeout,
      env: plan.env,
      streaming: false,
    }

    try {
      const execResult = await adapter.run(task, config)

      // Collect changed files info
      const changedFiles = getChangedFiles(workspace.path)
      const diff = getDiffOutput(workspace.path)
      const diffStats = getDiffStats(workspace.path)

      execResult.artifacts.filesChanged = changedFiles
      execResult.artifacts.diff = diff

      // Save artifacts
      const runArtifactsDir = path.join(artifactsDir, runId)
      fs.mkdirSync(runArtifactsDir, { recursive: true })
      fs.writeFileSync(path.join(runArtifactsDir, "stdout.txt"), execResult.artifacts.stdout)
      fs.writeFileSync(path.join(runArtifactsDir, "stderr.txt"), execResult.artifacts.stderr)
      if (diff) fs.writeFileSync(path.join(runArtifactsDir, "diff.patch"), diff)

      // Grade
      const gradingResult = await grade(task, workspace.path)

      // Collect metrics
      const metrics = await adapter.collectMetrics(execResult.artifacts)

      const completedAt = new Date()
      const durationMs = completedAt.getTime() - run.startedAt.getTime()

      const status = execResult.status === "timeout" ? "timeout" as const
        : execResult.status === "error" ? "failed" as const
        : "completed" as const

      db.updateRunStatus(runId, status, completedAt, durationMs)

      const result: Result = {
        runId,
        passed: gradingResult.passed,
        score: gradingResult.score,
        metrics: {
          tokensInput: metrics.tokensInput,
          tokensOutput: metrics.tokensOutput,
          tokensCacheWrite: metrics.tokensCacheWrite,
          tokensCacheRead: metrics.tokensCacheRead,
          wallClockMs: durationMs,
          toolCalls: metrics.toolCalls,
          toolCallsByType: metrics.toolCallsByType,
          turns: metrics.turns,
          costUsd: metrics.costUsd,
          filesChanged: changedFiles.length,
          linesAdded: diffStats.linesAdded,
          linesRemoved: diffStats.linesRemoved,
          diffSize: diffStats.diffSize,
        },
        validation: {
          type: gradingResult.type,
          details: gradingResult.details,
          testsRun: gradingResult.testsRun,
          testsPassed: gradingResult.testsPassed,
          testsFailed: gradingResult.testsFailed,
        },
      }

      db.insertResult(result)
      results.push({ run: { ...run, status, completedAt, durationMs }, result })
    } catch (err) {
      const completedAt = new Date()
      const durationMs = completedAt.getTime() - run.startedAt.getTime()
      db.updateRunStatus(runId, "failed", completedAt, durationMs)

      const result: Result = {
        runId,
        passed: false,
        score: 0,
        metrics: {
          tokensInput: 0,
          tokensOutput: 0,
          wallClockMs: durationMs,
          toolCalls: 0,
          turns: 0,
          costUsd: 0,
        },
        error: {
          type: "execution_error",
          message: err instanceof Error ? err.message : String(err),
        },
      }

      db.insertResult(result)
      results.push({ run: { ...run, status: "failed", completedAt, durationMs }, result })
    } finally {
      workspace.cleanup()
      await adapter.teardown?.()
    }

    completed++
  }

  onProgress?.({ total, completed })
  return results
}
