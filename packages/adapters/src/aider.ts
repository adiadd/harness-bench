import { spawn } from "node:child_process"
import { type Task } from "@workspace/core/schemas"
import {
  type HarnessAdapter,
  type HarnessSetupResult,
  type ExecutionConfig,
  type ExecutionResult,
  type ExecutionArtifacts,
  type AdapterMetrics,
} from "./types.js"

export class AiderAdapter implements HarnessAdapter {
  id = "aider"
  name = "Aider"

  async setup(): Promise<HarnessSetupResult> {
    try {
      const version = await this.getVersion()
      return { ready: true, version }
    } catch {
      return { ready: false, version: "unknown", error: "Aider CLI not found" }
    }
  }

  private getVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn("aider", ["--version"], { stdio: ["pipe", "pipe", "pipe"] })
      let stdout = ""
      proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()))
      proc.on("close", (code) => {
        if (code === 0) resolve(stdout.trim())
        else reject(new Error(`Exit code ${code}`))
      })
      proc.on("error", reject)
    })
  }

  async run(task: Task, config: ExecutionConfig): Promise<ExecutionResult> {
    const start = Date.now()
    const args = [
      "--message", task.prompt,
      "--model", config.model,
      "--yes-always",
      "--no-git",
      "--no-auto-commits",
    ]

    return new Promise((resolve) => {
      const proc = spawn("aider", args, {
        cwd: config.workspace,
        env: { ...process.env, ...config.env },
        stdio: ["pipe", "pipe", "pipe"],
        timeout: config.timeout,
      })

      let stdout = ""
      let stderr = ""

      proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()))
      proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()))

      const timer = setTimeout(() => {
        proc.kill("SIGTERM")
        resolve({
          status: "timeout",
          exitCode: -1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr, filesChanged: [] },
        })
      }, config.timeout)

      proc.on("close", (code) => {
        clearTimeout(timer)
        resolve({
          status: code === 0 ? "success" : "failure",
          exitCode: code ?? 1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr, filesChanged: [] },
        })
      })

      proc.on("error", (err) => {
        clearTimeout(timer)
        resolve({
          status: "error",
          exitCode: -1,
          duration: Date.now() - start,
          artifacts: { stdout, stderr: err.message, filesChanged: [] },
        })
      })
    })
  }

  async collectMetrics(artifacts: ExecutionArtifacts): Promise<AdapterMetrics> {
    const tokenMatch = artifacts.stderr.match(/Tokens:\s*([\d,]+)\s*sent.*?([\d,]+)\s*received/i)
    const costMatch = artifacts.stderr.match(/Cost:\s*\$?([\d.]+)/i)

    return {
      tokensInput: tokenMatch ? parseInt(tokenMatch[1]!.replace(/,/g, ""), 10) : 0,
      tokensOutput: tokenMatch ? parseInt(tokenMatch[2]!.replace(/,/g, ""), 10) : 0,
      toolCalls: 0,
      turns: 1,
      costUsd: costMatch ? parseFloat(costMatch[1]!) : 0,
    }
  }
}
