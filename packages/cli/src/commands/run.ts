import path from "node:path"
import { parseArgs } from "node:util"
import { BenchDB } from "@workspace/core/db"
import { loadTasks } from "@workspace/core/loader"
import { execute, type RunPlan } from "@workspace/runner/orchestrator"

export async function run() {
  const { values } = parseArgs({
    args: process.argv.slice(3),
    options: {
      harness: { type: "string" },
      model: { type: "string" },
      tasks: { type: "string" },
      timeout: { type: "string" },
    },
  })

  if (!values.harness) {
    console.error("Error: --harness is required (e.g., --harness claude-code,aider)")
    process.exit(1)
  }

  if (!values.model) {
    console.error("Error: --model is required (e.g., --model claude-opus-4-6)")
    process.exit(1)
  }

  const rootDir = path.resolve(import.meta.dirname, "../../..")
  const dataDir = path.join(rootDir, "data")
  const artifactsDir = path.join(dataDir, "artifacts")
  const dbPath = path.join(dataDir, "harness-bench.db")

  const harnessIds = values.harness.split(",").map((s) => s.trim())
  const timeout = values.timeout ? parseInt(values.timeout, 10) : 300_000

  const allTasks = loadTasks(dataDir)
  const tasks = values.tasks
    ? allTasks.filter((t) => t.suiteId === values.tasks)
    : allTasks

  if (tasks.length === 0) {
    console.error("No tasks found. Use --tasks <suite-id> or add tasks to data/tasks/")
    process.exit(1)
  }

  console.log(`Running ${tasks.length} task(s) x ${harnessIds.length} harness(es)`)
  console.log(`Model: ${values.model}`)
  console.log(`Timeout: ${timeout}ms`)
  console.log()

  const db = new BenchDB(dbPath)

  const plan: RunPlan = {
    tasks,
    harnessIds,
    modelId: values.model,
    timeout,
    env: {},
  }

  const results = await execute(plan, db, artifactsDir, (progress) => {
    if (progress.current) {
      console.log(
        `[${progress.completed + 1}/${progress.total}] ${progress.current.harnessId} -> ${progress.current.taskId}`
      )
    }
  })

  console.log()
  console.log("Results:")
  console.log("─".repeat(80))

  for (const { run: r, result } of results) {
    const status = result.passed ? "PASS" : "FAIL"
    const score = result.score.toFixed(1)
    const cost = result.metrics.costUsd.toFixed(4)
    const duration = (result.metrics.wallClockMs / 1000).toFixed(1)
    console.log(
      `  ${status}  ${r.harnessId.padEnd(15)} ${r.taskId.padEnd(30)} score=${score}  cost=$${cost}  ${duration}s`
    )
  }

  db.close()
}
