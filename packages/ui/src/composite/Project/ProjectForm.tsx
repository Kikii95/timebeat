import { forwardRef, type FormHTMLAttributes } from "react";
import { ProjectType, ProjectStatus, type Project } from "@timebeat/types";
import { PROJECT_COLORS, DEFAULT_PROJECT_COLOR } from "@timebeat/constants";
import { cn } from "../../utils/cn";
import { Input } from "../../primitives/Input";
import { Button } from "../../primitives/Button";

export interface ProjectFormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> {
  project?: Project | null;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const ProjectForm = forwardRef<HTMLFormElement, ProjectFormProps>(
  (
    {
      className,
      project,
      onSubmit,
      onCancel,
      isSubmitting = false,
      submitLabel = "Create Project",
      ...props
    },
    ref,
  ) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    };

    const isEditing = !!project;

    return (
      <form
        ref={ref}
        className={cn("space-y-4", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Project Name{" "}
            <span className="text-[var(--color-danger-500)]">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="My Awesome Project"
            defaultValue={project?.name}
            required
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="What is this project about?"
            defaultValue={project?.description ?? ""}
            disabled={isSubmitting}
            rows={3}
            className={cn(
              "w-full rounded-lg border border-[var(--color-border)]",
              "bg-[var(--color-surface)] px-3 py-2 text-sm",
              "placeholder:text-[var(--color-text-muted)]",
              "focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none",
            )}
          />
        </div>

        {/* Type & Color Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={project?.type ?? ProjectType.PERSONAL}
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-lg border border-[var(--color-border)]",
                "bg-[var(--color-surface)] px-3 py-2 text-sm",
                "focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {Object.values(ProjectType).map((type) => (
                <option key={type} value={type}>
                  {type.toLowerCase().replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={project?.status ?? ProjectStatus.ACTIVE}
                disabled={isSubmitting}
                className={cn(
                  "w-full rounded-lg border border-[var(--color-border)]",
                  "bg-[var(--color-surface)] px-3 py-2 text-sm",
                  "focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  defaultChecked={
                    project
                      ? project.color === color
                      : color === DEFAULT_PROJECT_COLOR
                  }
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <span
                  className={cn(
                    "block h-8 w-8 rounded-full border-2 border-transparent",
                    "peer-checked:border-[var(--color-text)] peer-checked:ring-2 peer-checked:ring-offset-2",
                    "transition-all",
                  )}
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Icon */}
        <div className="space-y-1.5">
          <label htmlFor="icon" className="text-sm font-medium">
            Icon (emoji)
          </label>
          <Input
            id="icon"
            name="icon"
            type="text"
            placeholder="🚀"
            defaultValue={project?.icon ?? ""}
            disabled={isSubmitting}
            maxLength={4}
          />
        </div>

        {/* Stack */}
        <div className="space-y-1.5">
          <label htmlFor="stack" className="text-sm font-medium">
            Tech Stack
          </label>
          <Input
            id="stack"
            name="stack"
            type="text"
            placeholder="React, TypeScript, Node.js"
            defaultValue={project?.stack?.join(", ") ?? ""}
            disabled={isSubmitting}
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Comma-separated list of technologies
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  },
);

ProjectForm.displayName = "ProjectForm";
