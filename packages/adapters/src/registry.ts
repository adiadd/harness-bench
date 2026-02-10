import { type HarnessAdapter } from "./types.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { AiderAdapter } from "./aider.js";
import { KiroAdapter } from "./kiro.js";
import { CursorAdapter } from "./cursor.js";

const adapters = new Map<string, () => HarnessAdapter>([
  ["claude-code", () => new ClaudeCodeAdapter()],
  ["aider", () => new AiderAdapter()],
  ["kiro", () => new KiroAdapter()],
  ["cursor", () => new CursorAdapter()],
]);

export function getAdapter(id: string): HarnessAdapter {
  const factory = adapters.get(id);
  if (!factory) {
    throw new Error(
      `Unknown harness adapter: "${id}". Available: ${[...adapters.keys()].join(", ")}`,
    );
  }
  return factory();
}

export function listAdapters(): string[] {
  return [...adapters.keys()];
}

export function registerAdapter(
  id: string,
  factory: () => HarnessAdapter,
): void {
  adapters.set(id, factory);
}
