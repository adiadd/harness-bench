import { ChartBar } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"

import { mockHarnesses, mockLeaderboard } from "@/lib/mock-data"
import { ScoreBadge } from "@/components/score-badge"

export default function CompareHarnessesPage() {
  const harnessNames = [...new Set(mockLeaderboard.map((e) => e.harness))]

  const harnessStats = harnessNames.map((name) => {
    const entries = mockLeaderboard.filter((e) => e.harness === name)
    const harness = mockHarnesses.find((h) => h.name === name)
    const avgScore = entries.reduce((s, e) => s + e.score, 0) / entries.length
    const avgPassRate =
      entries.reduce((s, e) => s + e.passRate, 0) / entries.length
    const avgCost = entries.reduce((s, e) => s + e.avgCost, 0) / entries.length
    const totalRuns = entries.reduce((s, e) => s + e.runs, 0)

    return {
      name,
      avgScore,
      avgPassRate,
      avgCost,
      totalRuns,
      capabilities: harness?.capabilities ?? [],
    }
  })

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ChartBar className="size-7" />
          <h1 className="text-3xl font-bold tracking-tight">
            Compare Harnesses
          </h1>
        </div>
        <p className="text-muted-foreground">
          Side-by-side comparison of harness performance across all benchmarks.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Metric</th>
                  {harnessStats.map((h) => (
                    <th key={h.name} className="px-4 py-3 font-medium">
                      {h.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Score</td>
                  {harnessStats.map((h) => (
                    <td key={h.name} className="px-4 py-3">
                      <ScoreBadge score={h.avgScore} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Pass Rate</td>
                  {harnessStats.map((h) => (
                    <td key={h.name} className="px-4 py-3">
                      {(h.avgPassRate * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Avg Cost</td>
                  {harnessStats.map((h) => (
                    <td key={h.name} className="px-4 py-3">
                      ${h.avgCost.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Total Runs</td>
                  {harnessStats.map((h) => (
                    <td key={h.name} className="px-4 py-3">
                      {h.totalRuns}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">Capabilities</td>
                  {harnessStats.map((h) => (
                    <td key={h.name} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {h.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
