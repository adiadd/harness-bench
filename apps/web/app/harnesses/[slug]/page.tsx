import { notFound } from "next/navigation";

import {
  ChartBar,
  CurrencyDollar,
  Lightning,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";

import { mockHarnesses, mockLeaderboard, mockRuns } from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
import { ScoreBadge } from "@/components/score-badge";

export default async function HarnessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const harness = mockHarnesses.find((h) => h.slug === slug);

  if (!harness) {
    notFound();
  }

  const leaderboardEntries = mockLeaderboard.filter(
    (entry) => entry.harness === harness.name,
  );
  const harnessRuns = mockRuns.filter((run) => run.harness === harness.name);

  const avgScore = leaderboardEntries.length
    ? leaderboardEntries.reduce((sum, e) => sum + e.score, 0) /
      leaderboardEntries.length
    : 0;
  const avgCost = leaderboardEntries.length
    ? leaderboardEntries.reduce((sum, e) => sum + e.avgCost, 0) /
      leaderboardEntries.length
    : 0;
  const avgPassRate = leaderboardEntries.length
    ? leaderboardEntries.reduce((sum, e) => sum + e.passRate, 0) /
      leaderboardEntries.length
    : 0;
  const totalRuns = leaderboardEntries.reduce((sum, e) => sum + e.runs, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{harness.name}</h1>
          <Badge variant="outline">{harness.provider}</Badge>
        </div>
        <p className="text-muted-foreground">{harness.description}</p>
        <div className="flex flex-wrap gap-2">
          {harness.capabilities.map((capability) => (
            <Badge key={capability} variant="secondary">
              {capability}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Performance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Avg Score"
            value={`${(avgScore * 100).toFixed(1)}%`}
            icon={<Trophy className="size-4" />}
          />
          <MetricCard
            title="Pass Rate"
            value={`${(avgPassRate * 100).toFixed(1)}%`}
            icon={<ChartBar className="size-4" />}
          />
          <MetricCard
            title="Avg Cost"
            value={`$${avgCost.toFixed(2)}`}
            icon={<CurrencyDollar className="size-4" />}
          />
          <MetricCard
            title="Total Runs"
            value={totalRuns}
            icon={<Lightning className="size-4" />}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Recent Runs</h2>
        <Card className="mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Run ID</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {harnessRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {run.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">{run.model}</td>
                      <td className="px-4 py-3">{run.task}</td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={run.score} />
                      </td>
                      <td className="px-4 py-3">${run.cost.toFixed(2)}</td>
                      <td className="px-4 py-3">{run.duration}s</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            run.status === "passed" ? "default" : "destructive"
                          }
                        >
                          {run.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {harnessRuns.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No runs recorded for this harness yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
