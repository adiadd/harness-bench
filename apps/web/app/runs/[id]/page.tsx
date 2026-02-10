import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  ArrowLeft,
  Trophy,
  CurrencyDollar,
  Clock,
  ChatCircleText,
  Wrench,
  ArrowsCounterClockwise,
} from "@phosphor-icons/react/dist/ssr"
import { mockRuns, mockTasks, mockHarnesses, mockModels } from "@/lib/mock-data"
import { MetricCard } from "@/components/metric-card"
import { ScoreBadge } from "@/components/score-badge"

interface TranscriptMessage {
  role: "user" | "assistant" | "tool"
  content: string
}

const mockTranscript: TranscriptMessage[] = [
  {
    role: "user",
    content:
      "Fix the failing test in `src/utils.ts`. The `parseConfig` function should handle empty strings by returning a default config object instead of throwing.",
  },
  {
    role: "assistant",
    content:
      "I will look at the current implementation of `parseConfig` in `src/utils.ts` and the failing test to understand the expected behavior.",
  },
  {
    role: "tool",
    content:
      'read_file: src/utils.ts\n\nexport function parseConfig(raw: string): Config {\n  const parsed = JSON.parse(raw)\n  return parsed as Config\n}',
  },
  {
    role: "assistant",
    content:
      'The issue is that `JSON.parse("")` throws a SyntaxError. I will add a guard clause to return a default config when the input is an empty string.',
  },
  {
    role: "tool",
    content:
      'edit_file: src/utils.ts\n\nexport function parseConfig(raw: string): Config {\n  if (!raw || raw.trim() === "") {\n    return { theme: "default", locale: "en" }\n  }\n  const parsed = JSON.parse(raw)\n  return parsed as Config\n}',
  },
  {
    role: "assistant",
    content:
      "The fix is applied. The `parseConfig` function now checks for empty or whitespace-only strings and returns a default config object. The test should pass now.",
  },
]

const mockDiff = `diff --git a/src/utils.ts b/src/utils.ts
index 3a4b2c1..8f9d0e2 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,4 +1,7 @@
 export function parseConfig(raw: string): Config {
+  if (!raw || raw.trim() === "") {
+    return { theme: "default", locale: "en" }
+  }
   const parsed = JSON.parse(raw)
   return parsed as Config
 }`

const roleMeta: Record<
  string,
  { label: string; bgClass: string; textClass: string; align: string }
> = {
  user: {
    label: "User",
    bgClass: "bg-blue-50 dark:bg-blue-950",
    textClass: "text-blue-800 dark:text-blue-200",
    align: "self-start",
  },
  assistant: {
    label: "Assistant",
    bgClass: "bg-zinc-50 dark:bg-zinc-900",
    textClass: "text-zinc-800 dark:text-zinc-200",
    align: "self-end",
  },
  tool: {
    label: "Tool",
    bgClass: "bg-amber-50 dark:bg-amber-950",
    textClass: "text-amber-800 dark:text-amber-200",
    align: "self-start",
  },
}

function TranscriptViewer({ messages }: { messages: TranscriptMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg, i) => {
        const meta = roleMeta[msg.role]!
        return (
          <div
            key={i}
            className={`flex max-w-[85%] flex-col gap-1 ${meta.align}`}
          >
            <span className={`text-xs font-medium ${meta.textClass}`}>
              {meta.label}
            </span>
            <div
              className={`rounded-lg border px-4 py-3 text-sm whitespace-pre-wrap ${meta.bgClass}`}
            >
              {msg.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const run = mockRuns.find((r) => r.id === id)

  if (!run) {
    notFound()
  }

  const task = mockTasks.find((t) => t.id === run.taskId)
  const harness = mockHarnesses.find((h) => h.id === run.harnessId)
  const model = mockModels.find((m) => m.id === run.modelId)
  const metrics = run.result?.metrics

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/runs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Runs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {harness?.name ?? run.harnessId}
          </h1>
          <p className="text-muted-foreground text-sm">
            Task: {task?.title ?? run.taskId} &middot; Model:{" "}
            {model?.name ?? run.modelId}
          </p>
        </div>
        <Badge
          variant={run.result?.passed ? "default" : "destructive"}
          className="text-sm"
        >
          {run.result?.passed ? "PASS" : "FAIL"}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Score"
          value={
            <ScoreBadge score={run.result?.score ?? 0} />
          }
          icon={<Trophy className="size-4" />}
        />
        <MetricCard
          label="Cost"
          value={`$${metrics?.costUsd?.toFixed(4) ?? "—"}`}
          icon={<CurrencyDollar className="size-4" />}
        />
        <MetricCard
          label="Duration"
          value={
            metrics?.wallClockMs != null
              ? `${(metrics.wallClockMs / 1000).toFixed(1)}s`
              : "—"
          }
          icon={<Clock className="size-4" />}
        />
        <MetricCard
          label="Tokens"
          value={
            metrics
              ? `${((metrics.tokensInput ?? 0) + (metrics.tokensOutput ?? 0)).toLocaleString()}`
              : "—"
          }
          icon={<ChatCircleText className="size-4" />}
        />
        <MetricCard
          label="Tool Calls"
          value={metrics?.toolCalls ?? "—"}
          icon={<Wrench className="size-4" />}
        />
        <MetricCard
          label="Turns"
          value={metrics?.turns ?? "—"}
          icon={<ArrowsCounterClockwise className="size-4" />}
        />
      </div>

      <Separator />

      {/* Transcript */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Transcript</h2>
        <Card>
          <CardContent className="pt-6">
            <TranscriptViewer messages={mockTranscript} />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Diff */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Diff</h2>
        <Card>
          <CardContent className="p-0">
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
              <code>{mockDiff}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
