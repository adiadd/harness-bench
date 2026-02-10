import Link from "next/link"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { ListChecks, Upload, ArrowRight } from "@phosphor-icons/react/dist/ssr"

export default function ContributePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contribute</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          harness-bench is community-driven. Submit new benchmark tasks or share
          results from your own runs to help build a more comprehensive picture
          of AI coding agent performance.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/contribute/task" className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="text-muted-foreground size-5" />
                <CardTitle>Submit a Task</CardTitle>
              </div>
              <CardDescription>
                Propose a new benchmark task for the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>
                Tasks are defined as YAML specs paired with test files and
                optional starter code. Each task includes a clear prompt,
                difficulty rating, language specification, and validation
                strategy.
              </p>
              <p>
                Good tasks are self-contained, have deterministic pass/fail
                criteria, and test a meaningful coding capability.
              </p>
              <div className="text-muted-foreground flex items-center gap-1 pt-2 text-sm font-medium transition-colors group-hover:text-foreground">
                View task submission guide
                <ArrowRight className="size-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/contribute/results" className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="text-muted-foreground size-5" />
                <CardTitle>Submit Results</CardTitle>
              </div>
              <CardDescription>
                Share benchmark runs from your own environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>
                Run benchmarks locally using the harness-bench CLI, then submit
                the result JSON via pull request. Results are validated
                automatically before merging.
              </p>
              <p>
                Submissions from diverse hardware and configurations help the
                community understand real-world performance variance.
              </p>
              <div className="text-muted-foreground flex items-center gap-1 pt-2 text-sm font-medium transition-colors group-hover:text-foreground">
                View results submission guide
                <ArrowRight className="size-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
