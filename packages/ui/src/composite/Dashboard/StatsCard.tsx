import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Card } from "../../primitives/Card";

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, description, icon, trend, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("", className)} padding="md" {...props}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              {title}
            </p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-[var(--color-text-subtle)]">
                {description}
              </p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive
                    ? "text-[var(--color-accent-600)]"
                    : "text-[var(--color-danger-600)]",
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
                <span className="text-[var(--color-text-subtle)]">
                  vs last week
                </span>
              </p>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-[var(--color-neutral-100)] p-2 text-xl">
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  },
);

StatsCard.displayName = "StatsCard";
