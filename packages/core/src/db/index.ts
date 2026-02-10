import Database from "better-sqlite3"
import path from "node:path"
import { type Run, type Result } from "../schemas/index.js"

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    harness_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    duration_ms INTEGER,
    data JSON NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS results (
    run_id TEXT PRIMARY KEY,
    passed BOOLEAN NOT NULL,
    score REAL NOT NULL,
    tokens_input INTEGER NOT NULL,
    tokens_output INTEGER NOT NULL,
    wall_clock_ms INTEGER NOT NULL,
    cost_usd REAL NOT NULL,
    tool_calls INTEGER DEFAULT 0,
    data JSON NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_runs_task ON runs(task_id)`,
  `CREATE INDEX IF NOT EXISTS idx_runs_harness ON runs(harness_id)`,
  `CREATE INDEX IF NOT EXISTS idx_runs_model ON runs(model_id)`,
  `CREATE INDEX IF NOT EXISTS idx_results_score ON results(score)`,
]

export class BenchDB {
  private db: Database.Database

  constructor(dbPath?: string) {
    const resolvedPath =
      dbPath ?? path.resolve(process.cwd(), "data", "harness-bench.db")
    this.db = new Database(resolvedPath)
    this.db.pragma("journal_mode = WAL")
    this.db.pragma("foreign_keys = ON")
    this.migrate()
  }

  private migrate(): void {
    for (const sql of MIGRATIONS) {
      this.db.exec(sql)
    }
  }

  insertRun(run: Run): void {
    const stmt = this.db.prepare(`
      INSERT INTO runs (id, task_id, harness_id, model_id, status, started_at, completed_at, duration_ms, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      run.id,
      run.taskId,
      run.harnessId,
      run.modelId,
      run.status,
      run.startedAt.toISOString(),
      run.completedAt?.toISOString() ?? null,
      run.durationMs ?? null,
      JSON.stringify(run)
    )
  }

  updateRunStatus(
    runId: string,
    status: Run["status"],
    completedAt?: Date,
    durationMs?: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE runs SET status = ?, completed_at = ?, duration_ms = ?
      WHERE id = ?
    `)
    stmt.run(
      status,
      completedAt?.toISOString() ?? null,
      durationMs ?? null,
      runId
    )
  }

  insertResult(result: Result): void {
    const stmt = this.db.prepare(`
      INSERT INTO results (run_id, passed, score, tokens_input, tokens_output, wall_clock_ms, cost_usd, tool_calls, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      result.runId,
      result.passed ? 1 : 0,
      result.score,
      result.metrics.tokensInput,
      result.metrics.tokensOutput,
      result.metrics.wallClockMs,
      result.metrics.costUsd,
      result.metrics.toolCalls,
      JSON.stringify(result)
    )
  }

  getRun(runId: string): Run | undefined {
    const row = this.db
      .prepare("SELECT data FROM runs WHERE id = ?")
      .get(runId) as { data: string } | undefined
    return row ? JSON.parse(row.data) : undefined
  }

  getResult(runId: string): Result | undefined {
    const row = this.db
      .prepare("SELECT data FROM results WHERE run_id = ?")
      .get(runId) as { data: string } | undefined
    return row ? JSON.parse(row.data) : undefined
  }

  getRunsByTask(taskId: string): Run[] {
    const rows = this.db
      .prepare("SELECT data FROM runs WHERE task_id = ? ORDER BY started_at DESC")
      .all(taskId) as { data: string }[]
    return rows.map((r) => JSON.parse(r.data))
  }

  getRunsByHarness(harnessId: string): Run[] {
    const rows = this.db
      .prepare(
        "SELECT data FROM runs WHERE harness_id = ? ORDER BY started_at DESC"
      )
      .all(harnessId) as { data: string }[]
    return rows.map((r) => JSON.parse(r.data))
  }

  getRunsWithResults(options?: {
    harnessId?: string
    modelId?: string
    taskId?: string
    limit?: number
  }): Array<{ run: Run; result: Result | null }> {
    const conditions: string[] = []
    const params: unknown[] = []

    if (options?.harnessId) {
      conditions.push("r.harness_id = ?")
      params.push(options.harnessId)
    }
    if (options?.modelId) {
      conditions.push("r.model_id = ?")
      params.push(options.modelId)
    }
    if (options?.taskId) {
      conditions.push("r.task_id = ?")
      params.push(options.taskId)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const limit = options?.limit ? `LIMIT ${options.limit}` : ""

    const rows = this.db
      .prepare(
        `SELECT r.data as run_data, res.data as result_data
         FROM runs r
         LEFT JOIN results res ON r.id = res.run_id
         ${where}
         ORDER BY r.started_at DESC
         ${limit}`
      )
      .all(...params) as { run_data: string; result_data: string | null }[]

    return rows.map((row) => ({
      run: JSON.parse(row.run_data),
      result: row.result_data ? JSON.parse(row.result_data) : null,
    }))
  }

  getLeaderboard(): Array<{
    harnessId: string
    modelId: string
    avgScore: number
    totalRuns: number
    passRate: number
    avgCost: number
    avgDuration: number
  }> {
    const rows = this.db
      .prepare(
        `SELECT
          r.harness_id,
          r.model_id,
          AVG(res.score) as avg_score,
          COUNT(*) as total_runs,
          AVG(CASE WHEN res.passed THEN 1.0 ELSE 0.0 END) as pass_rate,
          AVG(res.cost_usd) as avg_cost,
          AVG(res.wall_clock_ms) as avg_duration
        FROM runs r
        JOIN results res ON r.id = res.run_id
        WHERE r.status = 'completed'
        GROUP BY r.harness_id, r.model_id
        ORDER BY avg_score DESC`
      )
      .all() as Array<{
      harness_id: string
      model_id: string
      avg_score: number
      total_runs: number
      pass_rate: number
      avg_cost: number
      avg_duration: number
    }>

    return rows.map((row) => ({
      harnessId: row.harness_id,
      modelId: row.model_id,
      avgScore: row.avg_score,
      totalRuns: row.total_runs,
      passRate: row.pass_rate,
      avgCost: row.avg_cost,
      avgDuration: row.avg_duration,
    }))
  }

  getAllRuns(): Run[] {
    const rows = this.db
      .prepare("SELECT data FROM runs ORDER BY started_at DESC")
      .all() as { data: string }[]
    return rows.map((r) => JSON.parse(r.data))
  }

  close(): void {
    this.db.close()
  }
}
