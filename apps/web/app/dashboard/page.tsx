import Link from "next/link";

import {
  ArrowRight,
  ChartBar,
  CurrencyDollar,
  Lightning,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";

import { Card, CardContent } from "@workspace/ui/components/card";

import { mockLeaderboard, mockRuns } from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
import { ScoreBadge } from "@/components/score-badge";
import { HarnessChip } from "@/components/harness-chip";

export default function DashboardPage() {
  const totalRuns = mockRuns.length;
  const avgScore =
    mockLeaderboard.reduce((sum, entry) => sum + entry.score, 0) /
    mockLeaderboard.length;
  const avgCost =
    mockLeaderboard.reduce((sum, entry) => sum + entry.avgCost, 0) /
    mockLeaderboard.length;
  const passRate =
    mockLeaderboard.reduce((sum, entry) => sum + entry.passRate, 0) /
    mockLeaderboard.length;

  const sorted = [...mockLeaderboard].sort((a, b) => b.score - a.score);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of benchmark performance across all harnesses and models.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Runs"
          value={totalRuns}
          icon={<Lightning className="size-4" />}
        />
        <MetricCard
          title="Avg Score"
          value={`${(avgScore * 100).toFixed(1)}%`}
          icon={<Trophy className="size-4" />}
        />
        <MetricCard
          title="Avg Cost"
          value={`$${avgCost.toFixed(2)}`}
          icon={<CurrencyDollar className="size-4" />}
        />
        <MetricCard
          title="Pass Rate"
          value={`${(passRate * 100).toFixed(1)}%`}
          icon={<ChartBar className="size-4" />}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          <Link
            href="/harnesses/compare"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Compare
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Card className="mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Harness</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Pass Rate</th>
                    <th className="px-4 py-3 font-medium">Avg Cost</th>
                    <th className="px-4 py-3 font-medium">Runs</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((entry, index) => (
                    <tr
                      key={`${entry.harness}-${entry.model}`}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <HarnessChip name={entry.harness} />
                      </td>
                      <td className="px-4 py-3">{entry.model}</td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={entry.score} />
                      </td>
                      <td className="px-4 py-3">
                        {(entry.passRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">${entry.avgCost.toFixed(2)}</td>
                      <td className="px-4 py-3">{entry.runs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
