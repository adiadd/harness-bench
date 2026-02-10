import { cn } from "@workspace/ui/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowUp, ArrowDown, Minus } from "@phosphor-icons/react/dist/ssr";

type MetricCardProps = {
  title?: string;
  label?: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export function MetricCard({
  title,
  label,
  value,
  description,
  icon,
  trend,
  trendValue,
}: MetricCardProps) {
  const displayTitle = title ?? label;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          {icon}
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {trend && trendValue && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend === "up" && "text-green-600 dark:text-green-400",
                trend === "down" && "text-red-600 dark:text-red-400",
                trend === "neutral" && "text-muted-foreground",
              )}
            >
              {trend === "up" && <ArrowUp className="size-3" weight="bold" />}
              {trend === "down" && (
                <ArrowDown className="size-3" weight="bold" />
              )}
              {trend === "neutral" && (
                <Minus className="size-3" weight="bold" />
              )}
              {trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
