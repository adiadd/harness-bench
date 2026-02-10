import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  Exam,
  ChartBar,
  Function,
  Desktop,
  Scales,
} from "@phosphor-icons/react/dist/ssr"

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          How harness-bench scores, measures, and compares AI coding agents.
          Every design choice prioritizes transparency and reproducibility.
        </p>
      </div>

      <Separator />

      {/* Scoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Exam className="text-muted-foreground size-5" />
            <CardTitle>Scoring</CardTitle>
          </div>
          <CardDescription>
            How individual task attempts are graded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Each task attempt produces a score between 0 and 1. The scoring
            strategy depends on the task&apos;s validation configuration and may
            use one or more of the following approaches:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoringMethod
              label="Diff Match"
              description="Compares the agent's output against a known-good patch or file snapshot. Exact matches score 1.0; partial matches use a normalized edit-distance ratio."
            />
            <ScoringMethod
              label="Test Suite"
              description="Runs the project's test suite (e.g. Jest, pytest, Go test). The score equals the ratio of passing tests to total tests."
            />
            <ScoringMethod
              label="LLM Judge"
              description="A separate LLM evaluates the output against a rubric defined in the task spec. Useful for open-ended tasks where deterministic checks aren't feasible."
            />
            <ScoringMethod
              label="Hybrid"
              description="Combines multiple strategies with configurable weights. For example, 70% test-suite score + 30% LLM-judge score for tasks that need both correctness and code quality."
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChartBar className="text-muted-foreground size-5" />
            <CardTitle>Metrics</CardTitle>
          </div>
          <CardDescription>
            Raw measurements captured during every benchmark run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricItem
              name="Tokens"
              detail="Total input and output tokens consumed by the model during the task attempt."
            />
            <MetricItem
              name="Cost"
              detail="Estimated USD cost of the API calls, computed from the provider's published pricing at the time of the run."
            />
            <MetricItem
              name="Duration"
              detail="Wall-clock time from the first API request to the final response, measured in seconds."
            />
            <MetricItem
              name="Tool Calls"
              detail="Number of tool invocations (file reads, writes, shell commands, searches) the agent made."
            />
            <MetricItem
              name="Turns"
              detail="Number of conversational turns between the orchestrator and the model, indicating how many reasoning cycles were needed."
            />
          </div>
        </CardContent>
      </Card>

      {/* Derived Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Function className="text-muted-foreground size-5" />
            <CardTitle>Derived Metrics</CardTitle>
          </div>
          <CardDescription>
            Computed from raw metrics to enable meaningful comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricItem
              name="Cost Efficiency"
              detail="Score divided by cost (score/$). Higher is better — indicates how much quality you get per dollar spent."
            />
            <MetricItem
              name="Token Efficiency"
              detail="Score divided by total tokens (score/1K tokens). Measures how effectively the model uses its context budget."
            />
            <MetricItem
              name="Throughput"
              detail="Score divided by duration (score/second). Captures the speed-quality tradeoff."
            />
            <MetricItem
              name="Success Rate"
              detail="Percentage of attempts scoring above the task's pass threshold (default 0.8). A binary pass/fail view of capability."
            />
            <MetricItem
              name="Consistency"
              detail="Standard deviation of scores across repeated runs of the same task. Lower values indicate more deterministic behavior."
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Desktop className="text-muted-foreground size-5" />
            <CardTitle>Environment</CardTitle>
          </div>
          <CardDescription>
            Isolation and reproducibility guarantees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Every task attempt runs in its own isolated environment to prevent
            cross-contamination and ensure reproducibility:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Temporary directories</strong> — each run gets a fresh
              temp directory. The agent can only read and write within this
              sandbox.
            </li>
            <li>
              <strong>Git clones</strong> — for repository-based tasks, a clean
              shallow clone is created at the specified commit SHA, guaranteeing
              identical starting state.
            </li>
            <li>
              <strong>Dependency installation</strong> — project dependencies
              are installed before the agent begins, so setup time is excluded
              from duration measurements.
            </li>
            <li>
              <strong>No network access</strong> — agents cannot make outbound
              HTTP requests during a run (model API calls are the sole
              exception).
            </li>
            <li>
              <strong>Deterministic seeds</strong> — where supported, model
              temperature and seed parameters are fixed to minimize variance
              between runs.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Fairness */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scales className="text-muted-foreground size-5" />
            <CardTitle>Fairness</CardTitle>
          </div>
          <CardDescription>
            Ensuring apples-to-apples comparisons across harnesses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Meaningful benchmarking requires controlled variables. Every
            comparison on harness-bench enforces the following constraints:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Same model</strong> — leaderboard comparisons group
              results by the exact model identifier (e.g.{" "}
              <Badge variant="secondary" className="font-mono text-xs">
                claude-opus-4-6
              </Badge>
              ). Different models are shown but never ranked against each other
              on the same row.
            </li>
            <li>
              <strong>Same prompt</strong> — every harness receives the
              identical task prompt. No harness-specific prompt engineering or
              system instructions are injected.
            </li>
            <li>
              <strong>Same task context</strong> — the initial file tree, git
              state, and environment variables are byte-identical for every
              harness attempting a given task.
            </li>
            <li>
              <strong>No cherry-picking</strong> — all task attempts must be
              submitted, not just successful ones. The leaderboard reflects
              aggregate performance, not best-case performance.
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}

function ScoringMethod({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <div className="bg-muted/50 rounded-lg border p-3">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function MetricItem({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="bg-muted/50 rounded-lg border p-3">
      <p className="mb-1 text-sm font-medium">{name}</p>
      <p className="text-muted-foreground text-xs leading-relaxed">{detail}</p>
    </div>
  )
}
