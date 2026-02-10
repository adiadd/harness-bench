import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { type Task } from "@workspace/core/schemas";

export interface Workspace {
  path: string;
  cleanup(): void;
}

export function createWorkspace(task: Task, runId: string): Workspace {
  const tmpDir = path.join(os.tmpdir(), "harness-bench", runId);
  fs.mkdirSync(tmpDir, { recursive: true });

  if (task.context.repoUrl) {
    const cloneArgs = task.context.repoCommit
      ? ["git", "clone", "--depth", "1", task.context.repoUrl, tmpDir]
      : ["git", "clone", "--depth", "1", task.context.repoUrl, tmpDir];
    execSync(cloneArgs.join(" "), { stdio: "pipe" });

    if (task.context.repoCommit) {
      execSync(`git checkout ${task.context.repoCommit}`, {
        cwd: tmpDir,
        stdio: "pipe",
      });
    }
  }

  if (task.context.files) {
    for (const [filePath, content] of Object.entries(task.context.files)) {
      const fullPath = path.join(tmpDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf-8");
    }
  }

  return {
    path: tmpDir,
    cleanup() {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup
      }
    },
  };
}

export function getChangedFiles(workspacePath: string): string[] {
  try {
    const result = execSync("git diff --name-only HEAD", {
      cwd: workspacePath,
      encoding: "utf-8",
    });
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function getDiffOutput(workspacePath: string): string {
  try {
    return execSync("git diff HEAD", {
      cwd: workspacePath,
      encoding: "utf-8",
    });
  } catch {
    return "";
  }
}

export function getDiffStats(workspacePath: string): {
  linesAdded: number;
  linesRemoved: number;
  diffSize: number;
} {
  const diff = getDiffOutput(workspacePath);
  const lines = diff.split("\n");
  let linesAdded = 0;
  let linesRemoved = 0;

  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) linesAdded++;
    if (line.startsWith("-") && !line.startsWith("---")) linesRemoved++;
  }

  return { linesAdded, linesRemoved, diffSize: diff.length };
}
