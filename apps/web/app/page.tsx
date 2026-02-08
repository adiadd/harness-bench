import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">harness-bench</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                harness-bench
              </h2>
              <Badge variant="secondary">Work in Progress</Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              An initiative to benchmark harnesses against standardized tasks
              across multiple verticals.
            </p>
          </div>

          <Separator />

          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Benchmark dashboard and results coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
