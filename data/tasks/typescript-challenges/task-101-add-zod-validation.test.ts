import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const WORKSPACE = process.env.BENCH_WORKSPACE ?? process.cwd()

function readFile(filePath: string): string {
  return readFileSync(join(WORKSPACE, filePath), "utf-8")
}

describe("Task 101: Zod validation", () => {
  it("should import zod in the route file", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/import.*zod|from ['"]zod['"]/)
  })

  it("should define a schema with email, age, and country", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toContain("email")
    expect(content).toContain("age")
    expect(content).toContain("country")
    expect(content).toMatch(/z\.object/)
  })

  it("should validate email as an email type", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/\.email\(\)/)
  })

  it("should validate age with min 18 and max 120", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/\.min\(18\)/)
    expect(content).toMatch(/\.max\(120\)/)
  })

  it("should validate country as a 2-letter code", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/[A-Z].*\{2\}|regex|length.*2/)
  })

  it("should return 400 for invalid input", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/400/)
    expect(content).toMatch(/success.*false|false/)
  })

  it("should use safeParse or try/catch for validation", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/safeParse|try.*catch|parse/)
  })

  it("should return validated data on success", () => {
    const content = readFile("app/api/users/route.ts")
    expect(content).toMatch(/success.*true/)
  })
})
