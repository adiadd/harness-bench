import path from "node:path";
import { loadTasks, loadSuites } from "@workspace/core/loader";

export function listTasks() {
  const rootDir = path.resolve(import.meta.dirname, "../../..");
  const dataDir = path.join(rootDir, "data");
  const tasks = loadTasks(dataDir);
  const suites = loadSuites(dataDir);

  if (tasks.length === 0) {
    console.log("No tasks found in data/tasks/");
    return;
  }

  if (suites.length > 0) {
    console.log("Task Suites:");
    console.log();
    for (const s of suites) {
      console.log(
        `  ${s.id.padEnd(25)} ${s.name} (${s.category}, ${s.difficulty})`,
      );
      console.log(`  ${"".padEnd(25)} ${s.description}`);
      console.log();
    }
  }

  console.log("Tasks:");
  console.log();

  for (const t of tasks) {
    const tags = t.tags.join(", ");
    console.log(`  ${t.id.padEnd(35)} ${t.title}`);
    console.log(
      `  ${"".padEnd(35)} suite: ${t.suiteId}  difficulty: ${t.difficulty}  validation: ${t.validation.type}`,
    );
    console.log(`  ${"".padEnd(35)} tags: ${tags}`);
    console.log();
  }
}
