import { cn } from "@workspace/ui/lib/utils";

type ScoreBadgeProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

function getScoreColor(score: number): string {
  if (score >= 80)
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 60)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (score >= 40)
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function getSizeClasses(size: "sm" | "md" | "lg"): string {
  if (size === "sm") return "text-xs px-1.5 py-0.5 min-w-6";
  if (size === "lg") return "text-base px-3 py-1.5 min-w-10";
  return "text-sm px-2 py-1 min-w-8";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  return (
    <span
      data-slot="score-badge"
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
        getScoreColor(score),
        getSizeClasses(size),
      )}
    >
      {score}
    </span>
  );
}
