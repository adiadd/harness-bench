import path from "node:path";
import { parseArgs } from "node:util";
import { BenchDB } from "@workspace/core/db";

export function results() {
  const { values } = parseArgs({
    args: process.argv.slice(3),
    options: {
      last: { type: "string" },
      harness: { type: "string" },
      model: { type: "string" },
    },
  });

  const rootDir = path.resolve(import.meta.dirname, "../../../..");
  const dbPath = path.join(rootDir, "data", "harness-bench.db");

  const db = new BenchDB(dbPath);

  const limit = values.last ? parseInt(values.last, 10) : 10;
  const rows = db.getRunsWithResults({
    harnessId: values.harness,
    modelId: values.model,
    limit,
  });

  if (rows.length === 0) {
    console.log(
      "No results found. Run benchmarks first with: harness-bench run",
    );
    db.close();
    return;
  }

  console.log("Recent Results:");
  console.log("─".repeat(100));
  console.log(
    `  ${"Status".padEnd(6)} ${"Harness".padEnd(15)} ${"Task".padEnd(30)} ${"Score".padEnd(8)} ${"Cost".padEnd(10)} ${"Duration".padEnd(10)} ${"Tokens".padEnd(12)}`,
  );
  console.log("─".repeat(100));

  for (const { run: r, result } of rows) {
    if (!result) continue;
    const status = result.passed ? "PASS" : "FAIL";
    const score = result.score.toFixed(1);
    const cost = `$${result.metrics.costUsd.toFixed(4)}`;
    const duration = `${(result.metrics.wallClockMs / 1000).toFixed(1)}s`;
    const tokens = `${result.metrics.tokensInput + result.metrics.tokensOutput}`;

    console.log(
      `  ${status.padEnd(6)} ${r.harnessId.padEnd(15)} ${r.taskId.padEnd(30)} ${score.padEnd(8)} ${cost.padEnd(10)} ${duration.padEnd(10)} ${tokens.padEnd(12)}`,
    );
  }

  console.log();

  // Show leaderboard summary
  const leaderboard = db.getLeaderboard();
  if (leaderboard.length > 0) {
    console.log("Leaderboard:");
    console.log("─".repeat(80));
    console.log(
      `  ${"Harness".padEnd(15)} ${"Model".padEnd(20)} ${"Avg Score".padEnd(10)} ${"Pass Rate".padEnd(10)} ${"Avg Cost".padEnd(10)} ${"Runs".padEnd(6)}`,
    );
    console.log("─".repeat(80));

    for (const entry of leaderboard) {
      console.log(
        `  ${entry.harnessId.padEnd(15)} ${entry.modelId.padEnd(20)} ${entry.avgScore.toFixed(1).padEnd(10)} ${(entry.passRate * 100).toFixed(0).padEnd(9)}% $${entry.avgCost.toFixed(4).padEnd(9)} ${String(entry.totalRuns).padEnd(6)}`,
      );
    }
  }

  db.close();
}
