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
      ? ["git", "clone", "--branch", task.context.repoCommit, "--depth", "1", task.context.repoUrl, tmpDir]
      : ["git", "clone", "--depth", "1", task.context.repoUrl, tmpDir];
    execSync(cloneArgs.join(" "), { stdio: "pipe" });
  }

  if (task.context.files) {
    for (const [filePath, content] of Object.entries(task.context.files)) {
      const fullPath = path.join(tmpDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf-8");
    }
  }

  // Install dependencies if specified
  installDependencies(task, tmpDir);

  // Initialize git repo if not already one (needed for diff tracking)
  if (!task.context.repoUrl) {
    try {
      execSync("git init && git add -A && git commit -m 'initial' --allow-empty", {
        cwd: tmpDir,
        stdio: "pipe",
        env: { ...process.env, GIT_AUTHOR_NAME: "bench", GIT_AUTHOR_EMAIL: "bench@test", GIT_COMMITTER_NAME: "bench", GIT_COMMITTER_EMAIL: "bench@test" },
      });
    } catch {
      // Non-critical — diff tracking will return empty
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

/**
 * Copy test files into the workspace for grading.
 * Test files live alongside task YAMLs as `{taskId}.test.{ext}`.
 * They get placed at the paths specified in `task.validation.testFiles`.
 */
export function injectTestFiles(
  task: Task,
  workspacePath: string,
  dataDir: string,
): void {
  if (!task.validation.testFiles || task.validation.testFiles.length === 0)
    return;

  // Find the test file(s) next to the task YAML
  const suiteDir = path.join(dataDir, "tasks", task.suiteId);
  const candidates = fs.readdirSync(suiteDir).filter(
    (f) => f.startsWith(task.id) && /\.test\.\w+$/.test(f),
  );

  for (let i = 0; i < task.validation.testFiles.length; i++) {
    const destRelPath = task.validation.testFiles[i]!;
    const testFile = candidates[i];
    if (!testFile) continue;

    const srcPath = path.join(suiteDir, testFile);
    const destPath = path.join(workspacePath, destRelPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
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

function installDependencies(task: Task, workDir: string): void {
  const lang = task.context.language?.toLowerCase();
  const deps = task.context.dependencies;

  if (lang === "typescript" || lang === "javascript") {
    // Ensure package.json exists with dependencies
    const pkgPath = path.join(workDir, "package.json");
    let pkg: Record<string, unknown> = {};

    if (fs.existsSync(pkgPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      } catch {
        pkg = {};
      }
    }

    // Merge task-level dependencies into package.json
    if (deps && Object.keys(deps).length > 0) {
      const existing = (pkg.dependencies as Record<string, string>) ?? {};
      pkg.dependencies = { ...existing, ...deps };
    }

    // Only install if there are dependencies
    if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
      try {
        execSync("bun install --no-save", {
          cwd: workDir,
          stdio: "pipe",
          timeout: 60_000,
        });
      } catch (err) {
        console.error(
          `Warning: bun install failed in workspace: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  } else if (lang === "python") {
    // Install Python dependencies via pip
    const allDeps: string[] = [];

    if (deps) {
      for (const [pkg, version] of Object.entries(deps)) {
        allDeps.push(version === "latest" ? pkg : `${pkg}${version}`);
      }
    }

    if (allDeps.length > 0) {
      try {
        execSync(`pip install ${allDeps.join(" ")}`, {
          cwd: workDir,
          stdio: "pipe",
          timeout: 60_000,
        });
      } catch (err) {
        console.error(
          `Warning: pip install failed in workspace: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
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
