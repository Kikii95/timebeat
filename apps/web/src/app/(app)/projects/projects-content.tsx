"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@timebeat/types";
import {
  Button,
  Dialog,
  DialogFooter,
  ProjectForm,
  ProjectList,
} from "@timebeat/ui";
import { createProject } from "@/app/actions/projects";

interface ProjectsContentProps {
  initialProjects: Project[];
  error: string | null;
}

export function ProjectsContent({ initialProjects, error }: ProjectsContentProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateProject = async (formData: FormData) => {
    setFormError(null);

    startTransition(async () => {
      const result = await createProject(formData);

      if (result.success && result.data?.id) {
        setIsCreateOpen(false);
        router.push(`/projects/${result.data.id}`);
      } else {
        setFormError(result.error ?? "Failed to create project");
      }
    });
  };

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-[var(--color-text-muted)]">
            Organize your time by project
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ New Project</Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] p-4">
          <p className="text-sm text-[var(--color-danger-700)]">{error}</p>
        </div>
      )}

      {/* Projects list */}
      {initialProjects.length > 0 ? (
        <ProjectList
          projects={initialProjects}
          onSelect={handleSelectProject}
          view="grid"
        />
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="text-4xl">📁</div>
            <h2 className="text-lg font-medium">No projects yet</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Create your first project to start organizing your time tracking
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Project
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Project"
        description="Set up a new project to track your time"
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] p-3">
            <p className="text-sm text-[var(--color-danger-700)]">{formError}</p>
          </div>
        )}
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={isPending}
          submitLabel="Create Project"
        />
      </Dialog>
    </div>
  );
}
