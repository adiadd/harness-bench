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
  File,
  CheckCircle,
  GitPullRequest,
} from "@phosphor-icons/react/dist/ssr"

export default function SubmitTaskPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Submit a Benchmark Task
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
          Define a new coding challenge that AI agents will attempt to solve.
          Tasks should be self-contained, clearly specified, and
          deterministically verifiable.
        </p>
      </div>

      <Separator />

      {/* YAML Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <File className="text-muted-foreground size-5" />
            <CardTitle>Task YAML Format</CardTitle>
          </div>
          <CardDescription>
            Every task is defined by a YAML specification file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            The task spec describes what the agent should accomplish, how its
            output will be validated, and metadata used for filtering and
            display. Here is an example:
          </p>
          <pre className="bg-muted overflow-x-auto rounded-lg border p-4 text-xs leading-relaxed">
            <code>{`id: "ts-array-dedup"
suite: "typescript-challenges"
title: "Array Deduplication Utility"
description: |
  Implement a generic deduplication function that removes
  duplicate elements from an array while preserving order.
difficulty: medium
language: typescript
tags:
  - generics
  - arrays
  - utility

prompt: |
  Create a file src/dedup.ts that exports a function \`dedup<T>\`
  which takes an array and returns a new array with duplicates
  removed. Preserve the order of first occurrence.

validation:
  type: test-suite
  test_command: "bun test"
  test_files:
    - "tests/dedup.test.ts"
  pass_threshold: 1.0

context:
  language: typescript
  setup_command: "bun install"
  files:
    - "package.json"
    - "tsconfig.json"
    - "tests/dedup.test.ts"`}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-muted-foreground size-5" />
            <CardTitle>Requirements</CardTitle>
          </div>
          <CardDescription>
            What every task submission must include
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 font-mono text-xs"
              >
                1
              </Badge>
              <div>
                <strong>Test files</strong> — at least one test file that can
                deterministically verify the agent&apos;s output. Tests must
                pass when the correct solution is in place and fail otherwise.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 font-mono text-xs"
              >
                2
              </Badge>
              <div>
                <strong>Clear prompt</strong> — the prompt must be unambiguous.
                Specify file paths, function signatures, and expected behavior.
                Avoid vague language like &quot;implement something useful.&quot;
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 font-mono text-xs"
              >
                3
              </Badge>
              <div>
                <strong>Difficulty rating</strong> — one of{" "}
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                >
                  easy
                </Badge>{" "}
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                >
                  medium
                </Badge>{" "}
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                >
                  hard
                </Badge>
                . Be honest about difficulty from the perspective of an AI agent,
                not a human developer.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 font-mono text-xs"
              >
                4
              </Badge>
              <div>
                <strong>Language specification</strong> — the primary programming
                language the task targets. This is used for filtering and
                suite grouping on the dashboard.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 font-mono text-xs"
              >
                5
              </Badge>
              <div>
                <strong>Context files</strong> — all files the agent needs to
                start (package.json, config files, test files). These are copied
                into the sandbox before the agent begins.
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* PR Process */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitPullRequest className="text-muted-foreground size-5" />
            <CardTitle>Submission Process</CardTitle>
          </div>
          <CardDescription>How to get your task merged</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              Fork the{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                harness-bench
              </code>{" "}
              repository and create a new branch.
            </li>
            <li>
              Add your task directory under{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                tasks/&lt;suite-name&gt;/&lt;task-id&gt;/
              </code>{" "}
              containing the YAML spec, test files, and any context files.
            </li>
            <li>
              Run{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                harness-bench validate --task &lt;task-id&gt;
              </code>{" "}
              locally to verify the spec is well-formed and tests pass with a
              reference solution.
            </li>
            <li>
              Open a pull request with a description of what the task tests and
              why it is a useful addition to the benchmark suite.
            </li>
            <li>
              A maintainer will review the task for clarity, fairness, and
              non-overlap with existing tasks. Automated CI will also validate
              the spec.
            </li>
          </ol>
        </CardContent>
      </Card>
    </main>
  )
}
