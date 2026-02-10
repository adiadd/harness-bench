import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const WORKSPACE = process.env.BENCH_WORKSPACE ?? process.cwd()

function readFile(filePath: string): string {
  return readFileSync(join(WORKSPACE, filePath), "utf-8")
}

describe("Task 102: Fix async race condition", () => {
  it("should have a field to track in-flight promise", () => {
    const content = readFile("src/fetcher.ts")
    expect(content).toMatch(/private.*(?:inflight|inFlight|pending|promise|current)/i)
  })

  it("should check for in-flight promise before fetching", () => {
    const content = readFile("src/fetcher.ts")
    // Should check if there's already a pending promise
    expect(content).toMatch(/if.*(?:inflight|inFlight|pending|promise|current)/i)
  })

  it("should assign the fetch promise to the tracking field", () => {
    const content = readFile("src/fetcher.ts")
    // Should store the promise
    expect(content).toMatch(/this\.(?:inflight|inFlight|pending|promise|current).*=/)
  })

  it("should clear the in-flight promise after completion", () => {
    const content = readFile("src/fetcher.ts")
    // Should null out the promise in finally or after await
    expect(content).toMatch(/(?:finally|then|\.(?:inflight|inFlight|pending|promise|current)\s*=\s*null)/)
  })

  it("should still have cache TTL logic", () => {
    const content = readFile("src/fetcher.ts")
    expect(content).toMatch(/ttl/i)
    expect(content).toMatch(/Date\.now/)
    expect(content).toContain("cache")
  })

  it("should still have invalidate method", () => {
    const content = readFile("src/fetcher.ts")
    expect(content).toMatch(/invalidate.*\{/)
  })

  it("should return the same type T", () => {
    const content = readFile("src/fetcher.ts")
    expect(content).toMatch(/Promise<T>/)
  })
})
