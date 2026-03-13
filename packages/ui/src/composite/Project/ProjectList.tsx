import { forwardRef, type HTMLAttributes } from "react";
import type { Project } from "@timebeat/types";
import { cn } from "../../utils/cn";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "../../primitives/Skeleton";

export interface ProjectListProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  projects: Project[];
  selectedId?: string | null;
  onSelect?: (project: Project) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  view?: "grid" | "list";
}

export const ProjectList = forwardRef<HTMLDivElement, ProjectListProps>(
  (
    {
      className,
      projects,
      selectedId,
      onSelect,
      isLoading = false,
      emptyMessage = "No projects found",
      view = "grid",
      ...props
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3",
            className,
          )}
          {...props}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center",
            className,
          )}
          {...props}
        >
          <div className="mx-auto max-w-sm space-y-2">
            <p className="text-[var(--color-text-muted)]">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          view === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-3",
          className,
        )}
        {...props}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            selected={selectedId === project.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  },
);

ProjectList.displayName = "ProjectList";

// === SKELETON ===

function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
