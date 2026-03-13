import { forwardRef, type HTMLAttributes } from "react";
import type { Project } from "@timebeat/types";
import { formatDuration } from "@timebeat/utils";
import { cn } from "../../utils/cn";
import { Card } from "../../primitives/Card";
import { Badge } from "../../primitives/Badge";

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "primary",
  ARCHIVED: "secondary",
};

export interface ProjectCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  project: Project;
  onSelect?: (project: Project) => void;
  selected?: boolean;
  showStats?: boolean;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      className,
      project,
      onSelect,
      selected = false,
      showStats = true,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "cursor-pointer transition-all hover:border-[var(--color-primary-300)]",
          selected &&
            "border-[var(--color-primary-500)] ring-1 ring-[var(--color-primary-500)]",
          className,
        )}
        padding="md"
        onClick={() => onSelect?.(project)}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Color indicator */}
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
            style={{
              backgroundColor: project.color + "20",
              color: project.color,
            }}
          >
            {project.icon || project.name.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{project.name}</h3>
              <Badge
                variant={
                  statusColors[project.status] as
                    | "success"
                    | "warning"
                    | "primary"
                    | "secondary"
                }
              >
                {project.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>

            {project.description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                {project.description}
              </p>
            )}

            {showStats && (
              <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
                <span>⏱️ {formatDuration(project.totalTimeSeconds)}</span>
                {project.stack.length > 0 && (
                  <span className="truncate">
                    🛠️ {project.stack.slice(0, 2).join(", ")}
                    {project.stack.length > 2 &&
                      ` +${project.stack.length - 2}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  },
);

ProjectCard.displayName = "ProjectCard";
