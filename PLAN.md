# Harness Bench — Build Plan

A benchmarking platform to compare AI coding harnesses (Claude Code, Kiro CLI, Aider, Cursor Agent, etc.) running the same model on the same tasks.

---

## Architecture Overview

```
harness-bench/
├── apps/web/                  # Next.js dashboard (exists)
├── packages/
│   ├── ui/                    # shadcn components (exists)
│   ├── core/                  # Zod schemas, types, DB layer
│   ├── runner/                # Orchestrator, isolation, grading
│   ├── adapters/              # Harness-specific CLI adapters
│   └── cli/                   # User-facing `harness-bench` CLI
├── data/
│   ├── harnesses/             # YAML definitions (claude-code.yaml, etc.)
│   ├── models/                # Model pricing + metadata
│   ├── tasks/                 # YAML task specs (community-contributable)
│   └── harness-bench.db       # SQLite for queryable results
└── task-repos/                # Git-based isolated task codebases
```

---

## Phase 1: Core Types & Schemas (`packages/core`)

Everything depends on a solid data model. Use Zod as the source of truth.

### Entities

#### Harness

A tool being benchmarked (Claude Code, Kiro, Aider, etc.).

```typescript
const HarnessSchema = z.object({
  id: z.string(),                    // "claude-code"
  name: z.string(),                  // "Claude Code CLI"
  version: z.string(),
  provider: z.string(),              // "anthropic"
  executor: z.enum(['cli', 'api', 'docker', 'manual']),
  command: z.string().optional(),    // "claude"
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  capabilities: z.object({
    streaming: z.boolean(),
    multifile: z.boolean(),
    codeExecution: z.boolean(),
    webSearch: z.boolean(),
    shellAccess: z.boolean(),
  }),
});
```

#### Model

The LLM backing the harness.

```typescript
const ModelSchema = z.object({
  id: z.string(),                    // "claude-sonnet-4-5-20250929"
  name: z.string(),                  // "Claude Sonnet 4.5"
  provider: z.enum(['anthropic', 'openai', 'google', 'other']),
  family: z.string(),                // "claude-4.5"
  pricing: z.object({
    inputPerMillion: z.number(),
    outputPerMillion: z.number(),
    cacheWritePerMillion: z.number().optional(),
    cacheReadPerMillion: z.number().optional(),
  }),
  contextWindow: z.number(),
  maxOutput: z.number(),
});
```

#### Suite

A collection of related tasks.

```typescript
const SuiteSchema = z.object({
  id: z.string(),                    // "typescript-challenges"
  name: z.string(),
  description: z.string(),
  category: z.enum([
    'bug-fix', 'feature-add', 'refactor',
    'optimization', 'test-writing', 'docs', 'mixed',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  author: z.string(),
  tags: z.array(z.string()),
  taskIds: z.array(z.string()),
  version: z.string(),
});
```

#### Task

The actual benchmark challenge.

```typescript
const TaskSchema = z.object({
  id: z.string(),
  suiteId: z.string(),
  title: z.string(),
  description: z.string(),          // Markdown
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  estimatedMinutes: z.number().optional(),
  context: z.object({
    repoUrl: z.string().url().optional(),
    repoCommit: z.string().optional(),
    repoSnapshot: z.string().optional(),
    files: z.record(z.string(), z.string()).optional(),
    language: z.string(),
    framework: z.array(z.string()).optional(),
    requiredTools: z.array(z.string()).optional(),
  }),
  prompt: z.string(),               // What we tell the harness
  validation: z.object({
    type: z.enum(['test-suite', 'diff-match', 'llm-judge', 'manual', 'hybrid']),
    testCommand: z.string().optional(),
    testFiles: z.array(z.string()).optional(),
    expectedFiles: z.record(z.string(), z.string()).optional(),
    judgePrompt: z.string().optional(),
    maxScore: z.number().default(100),
    passingScore: z.number().default(70),
  }),
  author: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
});
```

#### Run

A single execution of harness + model on a task.

```typescript
const RunSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string(),
  harnessId: z.string(),
  modelId: z.string(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  durationMs: z.number().optional(),
  config: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    customFlags: z.record(z.string(), z.any()).optional(),
  }).optional(),
  environment: z.object({
    os: z.string(),
    arch: z.string(),
  }),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'timeout']),
  submittedBy: z.string().optional(),
});
```

#### Result

Outcome and metrics of a run.

```typescript
const ResultSchema = z.object({
  runId: z.string().uuid(),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  metrics: z.object({
    tokensInput: z.number(),
    tokensOutput: z.number(),
    tokensCacheWrite: z.number().optional(),
    tokensCacheRead: z.number().optional(),
    wallClockMs: z.number(),
    firstTokenMs: z.number().optional(),
    toolCalls: z.number(),
    toolCallsByType: z.record(z.string(), z.number()).optional(),
    turns: z.number(),
    edits: z.number().optional(),
    costUsd: z.number(),
    lintErrors: z.number().optional(),
    typeErrors: z.number().optional(),
    filesChanged: z.number().optional(),
    linesAdded: z.number().optional(),
    linesRemoved: z.number().optional(),
    diffSize: z.number().optional(),
  }),
  validation: z.object({
    type: z.string(),
    details: z.record(z.string(), z.any()),
    testsRun: z.number().optional(),
    testsPassed: z.number().optional(),
    testsFailed: z.number().optional(),
  }).optional(),
  error: z.object({
    type: z.string(),
    message: z.string(),
  }).optional(),
});
```

### Derived Metrics (computed at query time)

- **Cost efficiency** = costUsd / score
- **Token efficiency** = tokensTotal / score
- **Throughput** = score / (wallClockMs / 1000)
- **Success rate** = passedRuns / totalRuns (across multiple runs)
- **Consistency** = stddev(scores)

### Storage Strategy

| Data | Format | Why |
|------|--------|-----|
| Harnesses, Models | YAML files in `data/` | Easy to PR, version-controlled |
| Tasks, Suites | YAML files in `data/tasks/` | Community-contributable |
| Runs, Results | SQLite (`data/harness-bench.db`) | Queryable for leaderboards |
| Artifacts (transcripts, diffs, logs) | Files in `data/artifacts/{runId}/` | Large, not queryable |

### SQLite Tables

```sql
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  harness_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  duration_ms INTEGER,
  data JSON NOT NULL
);

CREATE TABLE results (
  run_id TEXT PRIMARY KEY,
  passed BOOLEAN NOT NULL,
  score REAL NOT NULL,
  tokens_input INTEGER NOT NULL,
  tokens_output INTEGER NOT NULL,
  wall_clock_ms INTEGER NOT NULL,
  cost_usd REAL NOT NULL,
  tool_calls INTEGER DEFAULT 0,
  data JSON NOT NULL
);

CREATE INDEX idx_runs_task ON runs(task_id);
CREATE INDEX idx_runs_harness ON runs(harness_id);
CREATE INDEX idx_runs_model ON runs(model_id);
CREATE INDEX idx_results_score ON results(score);
```

### Deliverables

- [ ] `packages/core/src/schemas/` — All Zod schemas
- [ ] `packages/core/src/db/` — SQLite wrapper with migrations
- [ ] Seed data — 2-3 harnesses, 2-3 models as YAML files in `data/`

---

## Phase 2: Execution Engine (`packages/runner` + `packages/adapters`)

### Adapter Pattern

Each harness gets an adapter that knows how to invoke its CLI and parse its output.

```typescript
interface HarnessAdapter {
  id: string;
  name: string;
  setup(): Promise<HarnessSetupResult>;
  run(task: Task, config: ExecutionConfig): Promise<ExecutionResult>;
  collectMetrics(artifacts: ExecutionArtifacts): Promise<Metrics>;
  teardown?(): Promise<void>;
}

interface ExecutionConfig {
  workspace: string;       // Isolated temp directory
  model: string;
  timeout: number;
  env: Record<string, string>;
  streaming: boolean;
}

interface ExecutionResult {
  status: 'success' | 'failure' | 'timeout' | 'error';
  exitCode: number;
  duration: number;
  artifacts: ExecutionArtifacts;
}
```

### Runner Orchestrator

```
User invokes CLI
  → Load task suite (YAML)
  → Create execution plan (harness x model x task combos)
  → For each combo:
      1. Clone task repo to temp dir
      2. Adapter invokes harness CLI with task prompt
      3. Capture stdout/stderr/metrics
      4. Grader validates output (test suite / diff / LLM-judge)
      5. Store result in SQLite + artifacts to disk
      6. Cleanup workspace
  → Aggregate results into report
```

### Grading

```typescript
class Grader {
  async grade(task, workspace, result): Promise<GradingResult> {
    switch (task.validation.type) {
      case 'test-suite': return this.gradeByTest(task, workspace);
      case 'diff-match': return this.gradeByDiff(task, workspace);
      case 'llm-judge': return this.gradeByLLM(task, workspace);
      case 'hybrid':    return this.gradeHybrid(task, workspace);
    }
  }
}
```

### Isolation

- **MVP:** OS temp directories with git clones (`mkdtemp`)
- **Future:** Docker containers for full sandboxing + reproducibility

### Deliverables

- [ ] `packages/adapters/src/types.ts` — Adapter interface
- [ ] `packages/adapters/src/claude-code.ts` — Claude Code adapter
- [ ] `packages/adapters/src/registry.ts` — Adapter registry
- [ ] `packages/runner/src/orchestrator.ts` — Run coordinator
- [ ] `packages/runner/src/isolation.ts` — Workspace management
- [ ] `packages/runner/src/grader.ts` — Result validation

---

## Phase 3: CLI (`packages/cli`)

```bash
# Run benchmarks
harness-bench run --harness claude-code,aider --model opus-4-6 --tasks basic

# List available harnesses
harness-bench list-harnesses

# List available tasks
harness-bench list-tasks

# View results
harness-bench results --last 10
```

### Deliverables

- [ ] `packages/cli/src/index.ts` — CLI entry point
- [ ] `run` command — Execute benchmarks
- [ ] `list-harnesses` command
- [ ] `list-tasks` command
- [ ] `results` command — Query stored results

---

## Phase 4: First Tasks

Hand-craft 3-5 tasks with test-suite grading to validate the pipeline end-to-end.

### Example Task (YAML)

```yaml
id: task-101-add-zod-validation
suiteId: typescript-challenges
title: "Add Zod validation to API routes"
difficulty: medium
estimatedMinutes: 15
tags: [typescript, zod, nextjs, validation]

context:
  language: typescript
  framework: [nextjs, zod]
  files:
    "app/api/users/route.ts": |
      import { NextRequest, NextResponse } from 'next/server';
      export async function POST(req: NextRequest) {
        const body = await req.json();
        return NextResponse.json({ success: true, user: body });
      }

prompt: |
  Add Zod validation to the POST handler in app/api/users/route.ts.
  Validate email, age (18-120), and country (2-letter code).
  Return 400 with error details if validation fails.

validation:
  type: test-suite
  testCommand: "bun test"
  passingScore: 80
  maxScore: 100
```

### Deliverables

- [ ] 3-5 tasks across bug-fix, feature-add, and refactor categories
- [ ] Test files for each task
- [ ] At least 2 languages (TypeScript + one other)

---

## Phase 5: Dashboard (`apps/web`)

### Routes

```
/dashboard                    — Leaderboard, performance matrix, radar chart
/harnesses                    — Card grid of all harnesses
/harnesses/[slug]             — Harness profile + performance breakdown
/harnesses/compare            — Head-to-head comparison (2-4 harnesses)
/tasks                        — Filterable task browser
/tasks/[id]                   — Task detail + all harness results
/runs/[id]                    — Full run detail (transcript, metrics, diff, timeline)
/runs/compare?ids=a,b,c       — Side-by-side run comparison
/contribute/task              — Submit new benchmark task
/contribute/results           — Submit benchmark results
/methodology                 — Scoring transparency docs
```

### Key Visualizations

| Viz | Purpose | Location |
|-----|---------|----------|
| Performance matrix | Sortable heatmap: harness x metric | `/dashboard` |
| Radar chart | Multi-dimensional comparison (overlapping) | `/dashboard`, `/harnesses/compare` |
| Cost vs. quality scatter | X=cost, Y=success rate, bubble=speed | `/dashboard` |
| Transcript viewer | Full conversation with tool calls, timestamps, tokens | `/runs/[id]` |
| Timeline waterfall | Token usage + tool calls over time | `/runs/[id]` |
| Diff viewer | Side-by-side code output comparison | `/runs/[id]`, `/runs/compare` |

### Reusable Components

- `MetricCard` — Large number + label + trend indicator
- `HarnessChip` — Logo + name, color-coded by performance
- `ScoreBadge` — Circular/pill badge with color gradient
- `FilterBar` — Sticky dropdowns + active filter badges
- `ComparisonTable` — Sortable, inline charts, expandable rows
- `TranscriptViewer` — Message bubbles, tool call indicators, syntax highlighting
- `TaskCard` — Compact card for grid views

### Killer Features

1. **Transcript viewer** — See *how* each harness thinks through problems
2. **Side-by-side run comparison** — Synchronized transcripts showing divergence points
3. **Performance matrix** — At-a-glance harness x category heatmap

### Deliverables

- [ ] `/dashboard` page with leaderboard table + placeholder charts
- [ ] `/harnesses` directory page
- [ ] `/harnesses/[slug]` profile page
- [ ] `/tasks` browser page
- [ ] `/tasks/[id]` detail page
- [ ] `/runs/[id]` detail page with transcript viewer
- [ ] `/harnesses/compare` comparison page

---

## Phase 6: More Adapters + Community

### Additional Adapters

- [ ] Kiro CLI adapter
- [ ] Aider adapter
- [ ] Cursor Agent adapter (if CLI/headless mode exists)

### Community Features

- [ ] Task contribution guide in `/methodology`
- [ ] Result submission pipeline (`/contribute/results`)
- [ ] CI/CD for validating new task submissions
- [ ] GitHub Actions workflow for scheduled benchmark runs

### CI/CD Example

```yaml
name: Nightly Benchmark
on:
  schedule:
    - cron: "0 2 * * *"
jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx harness-bench run --harness=claude-code,aider --model=opus-4-6
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Design Principles

1. **YAML for definitions, SQLite for results** — Easy to contribute, easy to query
2. **Adapter pattern** — Adding a harness = adding one file
3. **Test-suite grading by default** — Objective, reproducible, automatable
4. **Transcripts are first-class** — The *how* matters as much as the *what*
5. **Local-first** — Everything runs on your machine, cloud is optional
6. **Incremental value** — Useful with 2 harnesses and 3 tasks, scales to hundreds
