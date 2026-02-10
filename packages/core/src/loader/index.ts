import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"
import {
  HarnessSchema,
  ModelSchema,
  TaskSchema,
  SuiteSchema,
  type Harness,
  type Model,
  type Task,
  type Suite,
} from "../schemas/index.js"

function loadYamlFile<T>(filePath: string, schema: { parse: (data: unknown) => T }): T {
  const content = fs.readFileSync(filePath, "utf-8")
  const data = YAML.parse(content)
  return schema.parse(data)
}

function loadYamlDir<T>(
  dirPath: string,
  schema: { parse: (data: unknown) => T }
): T[] {
  if (!fs.existsSync(dirPath)) return []
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
  return files.map((f) => loadYamlFile(path.join(dirPath, f), schema))
}

export function loadHarnesses(dataDir: string): Harness[] {
  return loadYamlDir(path.join(dataDir, "harnesses"), HarnessSchema)
}

export function loadModels(dataDir: string): Model[] {
  return loadYamlDir(path.join(dataDir, "models"), ModelSchema)
}

export function loadTasks(dataDir: string): Task[] {
  const tasksDir = path.join(dataDir, "tasks")
  if (!fs.existsSync(tasksDir)) return []

  const tasks: Task[] = []
  const entries = fs.readdirSync(tasksDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const suiteDir = path.join(tasksDir, entry.name)
      const taskFiles = fs
        .readdirSync(suiteDir)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
      for (const tf of taskFiles) {
        if (tf.startsWith("suite")) continue
        tasks.push(loadYamlFile(path.join(suiteDir, tf), TaskSchema))
      }
    } else if (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")) {
      tasks.push(loadYamlFile(path.join(tasksDir, entry.name), TaskSchema))
    }
  }

  return tasks
}

export function loadSuites(dataDir: string): Suite[] {
  const tasksDir = path.join(dataDir, "tasks")
  if (!fs.existsSync(tasksDir)) return []

  const suites: Suite[] = []
  const entries = fs.readdirSync(tasksDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const suiteFile = path.join(tasksDir, entry.name, "suite.yaml")
      if (fs.existsSync(suiteFile)) {
        suites.push(loadYamlFile(suiteFile, SuiteSchema))
      }
    }
  }

  return suites
}

export function resolveDataDir(fromDir?: string): string {
  const base = fromDir ?? process.cwd()
  const dataDir = path.resolve(base, "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  return dataDir
}
