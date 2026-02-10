import { cn } from "@workspace/ui/lib/utils"

type HarnessChipProps = {
  id?: string
  name: string
  score?: number
}

function getDotColor(name: string, score?: number): string {
  if (score !== undefined) {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const normalized = name.toLowerCase()
  const colors: Record<string, string> = {
    "claude code": "bg-amber-500",
    "aider": "bg-blue-500",
    "kiro": "bg-violet-500",
  }
  return colors[normalized] ?? "bg-gray-500"
}

export function HarnessChip({ id, name, score }: HarnessChipProps) {
  return (
    <span
      data-slot="harness-chip"
      data-harness={id}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "bg-muted/50 text-xs font-medium text-foreground"
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", getDotColor(name, score))}
      />
      {name}
    </span>
  )
}
