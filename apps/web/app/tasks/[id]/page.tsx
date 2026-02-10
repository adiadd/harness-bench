import { notFound } from "next/navigation"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  ArrowLeft,
  Code,
  FileCode,
  Terminal,
  Clock,
  CurrencyDollar,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { mockTasks, mockRuns, mockHarnesses, mockModels } from "@/lib/mock-data"
import { ScoreBadge } from "@/components/score-badge"

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const task = mockTasks.find((t) => t.id === id)

  if (!task) {
    notFound()
  }

  const taskRuns = mockRuns.filter((r) => r.taskId === task.id)

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      {/* Back link */}
      <Link
        href="/tasks"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Tasks
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <Badge
            variant="secondary"
            className={difficultyColor[task.difficulty] ?? ""}
          >
            {task.difficulty}
          </Badge>
          <Badge variant="outline">{task.suiteId}</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl whitespace-pre-line">
          {task.description}
        </p>
      </div>

      <Separator />

      {/* Context & Validation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="size-4" />
              Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {task.context?.language && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <Badge variant="outline">{task.context.language}</Badge>
              </div>
            )}
            {task.context.framework && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework</span>
                <Badge variant="outline">
                  {task.context.framework}
                </Badge>
              </div>
            )}
            {task.context.files && (
              <div className="space-y-1">
                <span className="text-muted-foreground">Files</span>
                <div className="flex flex-wrap gap-1">
                  {task.context.files.map((f: string) => (
                    <Badge key={f} variant="secondary" className="gap-1 text-xs">
                      <FileCode className="size-3" />
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="size-4" />
              Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline">{task.validation?.type ?? "unknown"}</Badge>
            </div>
            {task.validation.testCommand && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Command</span>
                <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                  {task.validation.testCommand}
                </code>
              </div>
            )}
            {task.validation.passingScore != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-medium">
                  {task.validation.passingScore}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results by Harness */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results by Harness</h2>

        {taskRuns.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No runs recorded for this task yet.
          </p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Harness</th>
                      <th className="px-4 py-3 text-left font-medium">Model</th>
                      <th className="px-4 py-3 text-left font-medium">Score</th>
                      <th className="px-4 py-3 text-left font-medium">Cost</th>
                      <th className="px-4 py-3 text-left font-medium">Duration</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskRuns.map((run) => {
                      const harness = mockHarnesses.find(
                        (h) => h.id === run.harnessId
                      )
                      const model = mockModels.find((m) => m.id === run.modelId)
                      return (
                        <tr key={run.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">
                            {harness?.name ?? run.harnessId}
                          </td>
                          <td className="px-4 py-3">
                            {model?.name ?? run.modelId}
                          </td>
                          <td className="px-4 py-3">
                            <ScoreBadge score={run.result?.score ?? 0} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              <CurrencyDollar className="size-3" />
                              {run.result?.metrics?.costUsd?.toFixed(4) ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {run.result?.metrics?.wallClockMs != null
                                ? `${(run.result.metrics.wallClockMs / 1000).toFixed(1)}s`
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                run.result?.passed ? "default" : "destructive"
                              }
                            >
                              {run.result?.passed ? "PASS" : "FAIL"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
