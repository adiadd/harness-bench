import { spawn } from "node:child_process";
import { type Task } from "@workspace/core/schemas";
import { env } from "@workspace/env";
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

      // Pre-flight: verify claude can actually respond (catches missing API key)
      if (!env.ANTHROPIC_API_KEY) {
        return {
          ready: false,
          version,
          error:
            "ANTHROPIC_API_KEY is not set. Claude Code subprocesses require this env var (OAuth is not inherited).",
        };
      }

      return { ready: true, version };
    } catch {
      return {
        ready: false,
        version: "unknown",
        error:
          "Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code",
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
      "--dangerously-skip-permissions",
      "--max-turns",
      "20",
    ];

    return new Promise((resolve) => {
      const proc = spawn("claude", args, {
        cwd: config.workspace,
        env: { ...process.env, ...config.env },
        stdio: ["ignore", "pipe", "pipe"],
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
        // If process failed with empty stdout, include stderr for debugging
        if (code !== 0 && !stdout.trim() && stderr.trim()) {
          console.error(
            `[claude-code] Process exited with code ${code}. stderr: ${stderr.slice(0, 500)}`,
          );
        }
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

      // Extract from modelUsage (aggregated across all models used)
      let tokensInput = 0;
      let tokensOutput = 0;
      let tokensCacheWrite = 0;
      let tokensCacheRead = 0;
      let costUsd = 0;

      if (data.modelUsage) {
        for (const model of Object.values(data.modelUsage) as Array<
          Record<string, number>
        >) {
          tokensInput += model.inputTokens ?? 0;
          tokensOutput += model.outputTokens ?? 0;
          tokensCacheWrite += model.cacheCreationInputTokens ?? 0;
          tokensCacheRead += model.cacheReadInputTokens ?? 0;
          costUsd += model.costUSD ?? 0;
        }
      }

      // Fallback to top-level usage if modelUsage missing
      if (tokensInput === 0 && data.usage) {
        tokensInput = data.usage.input_tokens ?? 0;
        tokensOutput = data.usage.output_tokens ?? 0;
        tokensCacheWrite = data.usage.cache_creation_input_tokens ?? 0;
        tokensCacheRead = data.usage.cache_read_input_tokens ?? 0;
      }

      if (costUsd === 0) {
        costUsd = data.total_cost_usd ?? data.cost_usd ?? 0;
      }

      return {
        tokensInput,
        tokensOutput,
        tokensCacheWrite: tokensCacheWrite || undefined,
        tokensCacheRead: tokensCacheRead || undefined,
        toolCalls: data.num_tool_uses ?? 0,
        turns: data.num_turns ?? 1,
        costUsd,
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
