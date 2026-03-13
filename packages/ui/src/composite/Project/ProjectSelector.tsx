import { forwardRef, type HTMLAttributes } from "react";
import type { Project } from "@timebeat/types";
import { cn } from "../../utils/cn";

export interface ProjectSelectorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  projects: Project[];
  selectedId?: string | null;
  onSelect: (project: Project | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ProjectSelector = forwardRef<HTMLDivElement, ProjectSelectorProps>(
  (
    {
      className,
      projects,
      selectedId,
      onSelect,
      disabled = false,
      placeholder = "Select a project",
      ...props
    },
    ref,
  ) => {
    const selectedProject = projects.find((p) => p.id === selectedId);

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <label className="text-sm font-medium text-[var(--color-text)]">
          Project
        </label>
        <select
          value={selectedId || ""}
          onChange={(e) => {
            const project = projects.find((p) => p.id === e.target.value);
            onSelect(project || null);
          }}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-[var(--color-border)]",
            "bg-[var(--color-surface)] px-3 py-2 text-sm",
            "focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <option value="">{placeholder}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.icon || "📁"} {project.name}
            </option>
          ))}
        </select>
        {selectedProject && (
          <p className="text-xs text-[var(--color-text-subtle)]">
            {selectedProject.type.toLowerCase().replace("_", " ")} •{" "}
            {selectedProject.status.toLowerCase().replace("_", " ")}
          </p>
        )}
      </div>
    );
  },
);

ProjectSelector.displayName = "ProjectSelector";
