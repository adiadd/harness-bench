import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  ArrowsLeftRight,
  Trophy,
  Clock,
  CurrencyDollar,
  ChatCircleText,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import {
  mockRuns,
  mockTasks,
  mockHarnesses,
  mockModels,
} from "@/lib/mock-data";
import { ScoreBadge } from "@/components/score-badge";

export default function CompareRunsPage() {
  const runsToCompare = mockRuns.slice(0, 3);

  const rows: {
    label: string;
    icon: React.ReactNode;
    render: (run: (typeof mockRuns)[number]) => React.ReactNode;
  }[] = [
    {
      label: "Score",
      icon: <Trophy className="size-4" />,
      render: (run) => <ScoreBadge score={run.result?.score ?? 0} />,
    },
    {
      label: "Duration",
      icon: <Clock className="size-4" />,
      render: (run) =>
        run.result?.metrics?.wallClockMs != null
          ? `${(run.result.metrics.wallClockMs / 1000).toFixed(1)}s`
          : "—",
    },
    {
      label: "Cost",
      icon: <CurrencyDollar className="size-4" />,
      render: (run) =>
        run.result?.metrics?.costUsd != null
          ? `$${run.result.metrics.costUsd.toFixed(4)}`
          : "—",
    },
    {
      label: "Tokens",
      icon: <ChatCircleText className="size-4" />,
      render: (run) => {
        const m = run.result?.metrics;
        if (!m) return "—";
        return ((m.tokensInput ?? 0) + (m.tokensOutput ?? 0)).toLocaleString();
      },
    },
    {
      label: "Tool Calls",
      icon: <Wrench className="size-4" />,
      render: (run) => run.result?.metrics?.toolCalls ?? "—",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ArrowsLeftRight className="size-7" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare Runs</h1>
          <p className="text-muted-foreground mt-1">
            Side-by-side comparison of benchmark runs
          </p>
        </div>
      </div>

      <Separator />

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Column headers — one per run */}
              <thead>
                <tr className="border-b">
                  <th className="w-40 px-4 py-3 text-left font-medium">
                    Metric
                  </th>
                  {runsToCompare.map((run) => {
                    const harness = mockHarnesses.find(
                      (h) => h.id === run.harnessId,
                    );
                    const model = mockModels.find((m) => m.id === run.modelId);
                    const task = mockTasks.find((t) => t.id === run.taskId);
                    return (
                      <th key={run.id} className="px-4 py-3 text-left">
                        <div className="space-y-1">
                          <span className="font-semibold">
                            {harness?.name ?? run.harnessId}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {model?.name ?? run.modelId}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {task?.title ?? run.taskId}
                            </Badge>
                          </div>
                          <Badge
                            variant={
                              run.result?.passed ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {run.result?.passed ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Comparison rows */}
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        {row.icon}
                        {row.label}
                      </span>
                    </td>
                    {runsToCompare.map((run) => (
                      <td key={run.id} className="px-4 py-3">
                        {row.render(run)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
