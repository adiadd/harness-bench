import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/ui/components/card"
import { ListChecks, Code, Tag } from "@phosphor-icons/react/dist/ssr"
import { mockTasks } from "@/lib/mock-data"

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Benchmark Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Browse all tasks across benchmark suites
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockTasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <Card className="h-full transition-colors hover:border-foreground/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {task.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={difficultyColor[task.difficulty] ?? ""}
                  >
                    {task.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm">
                  {task.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ListChecks className="size-3" />
                    {task.suiteId}
                  </Badge>
                  {task.context?.language && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Code className="size-3" />
                      {task.context.language}
                    </Badge>
                  )}
                  {task.tags?.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      <Tag className="size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <span className="text-muted-foreground text-xs">
                  Validation: {task.validation?.type ?? "unknown"}
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
