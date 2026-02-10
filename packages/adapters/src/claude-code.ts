import { spawn } from "node:child_process";
import { type Task } from "@workspace/core/schemas";
import {
  type HarnessAdapter,
  type HarnessSetupResult,
  type ExecutionConfig,
  type ExecutionResult,
  type ExecutionArtifacts,
  type AdapterMetrics,
} from "./types.js";

export class ClaudeCodeAdapter implements HarnessAdapter {
  id = "claude-code";
  name = "Claude Code CLI";

  async setup(): Promise<HarnessSetupResult> {
    try {
      const version = await this.getVersion();
      return { ready: true, version };
    } catch {
      return {
        ready: false,
        version: "unknown",
        error: "Claude Code CLI not found",
      };
    }
  }

  private getVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn("claude", ["--version"], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      let stdout = "";
      proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
      proc.on("close", (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`Exit code ${code}`));
      });
      proc.on("error", reject);
    });
  }

  async run(task: Task, config: ExecutionConfig): Promise<ExecutionResult> {
    const start = Date.now();
    const args = [
      "--print",
      task.prompt,
      "--model",
      config.model,
      "--output-format",
      "json",
    ];

    return new Promise((resolve) => {
      const proc = spawn("claude", args, {
        cwd: config.workspace,
        env: { ...process.env, ...config.env },
        stdio: ["pipe", "pipe", "pipe"],
        timeout: config.timeout,
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
      proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

      const timer = setTimeout(() => {
        proc.kill("SIGTERM");
        resolve({
          status: "timeout",
          exitCode: -1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr, filesChanged: [] },
        });
      }, config.timeout);

      proc.on("close", (code) => {
        clearTimeout(timer);
        resolve({
          status: code === 0 ? "success" : "failure",
          exitCode: code ?? 1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr, filesChanged: [] },
        });
      });

      proc.on("error", (err) => {
        clearTimeout(timer);
        resolve({
          status: "error",
          exitCode: -1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr: err.message, filesChanged: [] },
        });
      });
    });
  }

  async collectMetrics(artifacts: ExecutionArtifacts): Promise<AdapterMetrics> {
    try {
      const data = JSON.parse(artifacts.stdout);
      return {
        tokensInput: data.usage?.input_tokens ?? 0,
        tokensOutput: data.usage?.output_tokens ?? 0,
        tokensCacheWrite: data.usage?.cache_creation_input_tokens,
        tokensCacheRead: data.usage?.cache_read_input_tokens,
        toolCalls: data.num_tool_uses ?? 0,
        turns: data.num_turns ?? 1,
        costUsd: data.cost_usd ?? 0,
      };
    } catch {
      return {
        tokensInput: 0,
        tokensOutput: 0,
        toolCalls: 0,
        turns: 1,
        costUsd: 0,
      };
    }
  }
}
