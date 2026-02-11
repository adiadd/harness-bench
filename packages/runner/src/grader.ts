import { spawnSync } from "node:child_process";
import { type Task } from "@workspace/core/schemas";

export interface GradingResult {
  passed: boolean;
  score: number;
  type: string;
  details: Record<string, unknown>;
  testsRun?: number;
  testsPassed?: number;
  testsFailed?: number;
}

export async function grade(
  task: Task,
  workspacePath: string,
): Promise<GradingResult> {
  switch (task.validation.type) {
    case "test-suite":
      return gradeByTest(task, workspacePath);
    case "diff-match":
      return gradeByDiff(task, workspacePath);
    case "llm-judge":
      return gradeByLLMJudge(task, workspacePath);
    case "hybrid":
      return gradeHybrid(task, workspacePath);
    case "manual":
      return {
        passed: false,
        score: 0,
        type: "manual",
        details: { message: "Manual grading required" },
      };
  }
}

async function gradeByTest(
  task: Task,
  workspacePath: string,
): Promise<GradingResult> {
  const command = task.validation.testCommand ?? "npm test";
  const parts = command.split(" ");

  const result = spawnSync(parts[0]!, parts.slice(1), {
    cwd: workspacePath,
    encoding: "utf-8",
    timeout: 60_000,
    env: { ...process.env, CI: "true", NO_COLOR: "1" },
  });

  // Combine stdout + stderr since test runners may use either
  const output = (result.stdout ?? "") + "\n" + (result.stderr ?? "");
  const isError = result.status !== 0;

  const { total, passed, failed } = parseTestOutput(output);
  const score = total > 0 ? (passed / total) * task.validation.maxScore : 0;

  return {
    passed: score >= task.validation.passingScore,
    score,
    type: "test-suite",
    details: { output, command, ...(isError ? { error: true } : {}) },
    testsRun: total,
    testsPassed: passed,
    testsFailed: failed,
  };
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function parseTestOutput(rawOutput: string): {
  total: number;
  passed: number;
  failed: number;
} {
  const output = stripAnsi(rawOutput);

  // Jest/Vitest: "Tests: X passed, Y failed, Z total"
  const jestMatch = output.match(
    /Tests:\s*(\d+)\s*passed.*?(\d+)\s*failed.*?(\d+)\s*total/i,
  );
  if (jestMatch) {
    return {
      passed: parseInt(jestMatch[1]!, 10),
      failed: parseInt(jestMatch[2]!, 10),
      total: parseInt(jestMatch[3]!, 10),
    };
  }

  // Jest pass-only: "Tests: X passed, X total"
  const jestPassMatch = output.match(
    /Tests:\s*(\d+)\s*passed.*?(\d+)\s*total/i,
  );
  if (jestPassMatch) {
    const passed = parseInt(jestPassMatch[1]!, 10);
    return { passed, failed: 0, total: parseInt(jestPassMatch[2]!, 10) };
  }

  // Bun test: "X pass" and "Y fail" (may be on separate lines)
  const bunPassMatch = output.match(/(\d+)\s*pass/i);
  const bunFailMatch = output.match(/(\d+)\s*fail/i);
  if (bunPassMatch) {
    const passed = parseInt(bunPassMatch[1]!, 10);
    const failed = bunFailMatch ? parseInt(bunFailMatch[1]!, 10) : 0;
    return { passed, failed, total: passed + failed };
  }

  // Pytest: "X passed, Y failed" or "X passed"
  const pytestMatch = output.match(
    /(\d+)\s*passed/i,
  );
  if (pytestMatch) {
    const passed = parseInt(pytestMatch[1]!, 10);
    const pytestFailMatch = output.match(/(\d+)\s*failed/i);
    const failed = pytestFailMatch ? parseInt(pytestFailMatch[1]!, 10) : 0;
    return { passed, failed, total: passed + failed };
  }

  return { total: 0, passed: 0, failed: 0 };
}

async function gradeByDiff(
  task: Task,
  workspacePath: string,
): Promise<GradingResult> {
  if (!task.validation.expectedFiles) {
    return {
      passed: false,
      score: 0,
      type: "diff-match",
      details: { error: "No expected files defined" },
    };
  }

  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");

  let matchedFiles = 0;
  const totalFiles = Object.keys(task.validation.expectedFiles).length;
  const details: Record<string, unknown> = {};

  for (const [filePath, expectedContent] of Object.entries(
    task.validation.expectedFiles,
  )) {
    const fullPath = join(workspacePath, filePath);
    if (!existsSync(fullPath)) {
      details[filePath] = "missing";
      continue;
    }

    const actual = readFileSync(fullPath, "utf-8").trim();
    const expected = expectedContent.trim();

    if (actual === expected) {
      matchedFiles++;
      details[filePath] = "match";
    } else {
      details[filePath] = "mismatch";
    }
  }

  const score =
    totalFiles > 0 ? (matchedFiles / totalFiles) * task.validation.maxScore : 0;

  return {
    passed: score >= task.validation.passingScore,
    score,
    type: "diff-match",
    details,
  };
}

async function gradeByLLMJudge(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _task: Task,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _workspacePath: string,
): Promise<GradingResult> {
  // Placeholder — requires LLM API integration
  return {
    passed: false,
    score: 0,
    type: "llm-judge",
    details: { message: "LLM judge grading not yet implemented" },
  };
}

async function gradeHybrid(
  task: Task,
  workspacePath: string,
): Promise<GradingResult> {
  const testResult = await gradeByTest(task, workspacePath);

  // If test suite passes, use that score; otherwise fall back to diff matching
  if (testResult.passed) return testResult;

  if (task.validation.expectedFiles) {
    const diffResult = await gradeByDiff(task, workspacePath);
    // Weighted: 70% test, 30% diff
    const combinedScore = testResult.score * 0.7 + diffResult.score * 0.3;
    return {
      passed: combinedScore >= task.validation.passingScore,
      score: combinedScore,
      type: "hybrid",
      details: { test: testResult.details, diff: diffResult.details },
      testsRun: testResult.testsRun,
      testsPassed: testResult.testsPassed,
      testsFailed: testResult.testsFailed,
    };
  }

  return testResult;
}
