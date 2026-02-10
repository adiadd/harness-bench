#!/usr/bin/env bun

import { parseArgs } from "node:util";

const { positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

switch (command) {
  case "run":
    await import("./commands/run.js").then((m) => m.run());
    break;
  case "list-harnesses":
    await import("./commands/list-harnesses.js").then((m) => m.listHarnesses());
    break;
  case "list-tasks":
    await import("./commands/list-tasks.js").then((m) => m.listTasks());
    break;
  case "results":
    await import("./commands/results.js").then((m) => m.results());
    break;
  case "help":
  case undefined:
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}

function printHelp() {
  console.log(`
harness-bench — AI coding harness benchmarking tool

Usage: harness-bench <command> [options]

Commands:
  run               Run benchmarks
  list-harnesses    List available harnesses
  list-tasks        List available benchmark tasks
  results           View stored results
  help              Show this help message

Run options:
  --harness <ids>   Comma-separated harness IDs (e.g., claude-code,aider)
  --model <id>      Model ID to use (e.g., claude-opus-4-6)
  --tasks <suite>   Task suite ID to run
  --timeout <ms>    Timeout per task in milliseconds (default: 300000)

Results options:
  --last <n>        Show last N results (default: 10)
  --harness <id>    Filter by harness
  --model <id>      Filter by model
`);
}
