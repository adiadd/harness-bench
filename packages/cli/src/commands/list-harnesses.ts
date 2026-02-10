import path from "node:path"
import { loadHarnesses } from "@workspace/core/loader"

export function listHarnesses() {
  const rootDir = path.resolve(import.meta.dirname, "../../..")
  const dataDir = path.join(rootDir, "data")
  const harnesses = loadHarnesses(dataDir)

  if (harnesses.length === 0) {
    console.log("No harnesses found in data/harnesses/")
    return
  }

  console.log("Available harnesses:")
  console.log()

  for (const h of harnesses) {
    const caps = Object.entries(h.capabilities)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ")

    console.log(`  ${h.id.padEnd(20)} ${h.name}`)
    console.log(`  ${"".padEnd(20)} provider: ${h.provider}  executor: ${h.executor}`)
    console.log(`  ${"".padEnd(20)} capabilities: ${caps}`)
    console.log()
  }
}
