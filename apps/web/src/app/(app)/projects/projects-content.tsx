"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProjectType, type Project } from "@timebeat/types";
import {
  Button,
  Dialog,
  ProjectForm,
  ProjectList,
  Skeleton,
} from "@timebeat/ui";
import {
  useProjects,
  useCreateProject,
  type CreateProjectInput,
} from "@timebeat/hooks";

interface ProjectsContentProps {
  initialProjects?: Project[] | null;
  error?: string | null;
}

export function ProjectsContent({
  initialProjects,
  error: initialError,
}: ProjectsContentProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Use client-side data fetching
  const { data: fetchedProjects, isLoading, error: fetchError } = useProjects();
  const createProjectMutation = useCreateProject();

  // Use initial data or fetched data
  const projects = fetchedProjects ?? initialProjects ?? [];
  const error = fetchError?.message ?? initialError;

  const handleCreateProject = async (formData: FormData) => {
    setFormError(null);

    const projectInput: CreateProjectInput = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      type: (formData.get("type") as CreateProjectInput["type"]) || ProjectType.PERSONAL,
      color: (formData.get("color") as string) || "#3B82F6",
      icon: (formData.get("icon") as string) || undefined,
      stack: [],
      platform: [],
    };

    startTransition(async () => {
      try {
        const result = await createProjectMutation.mutateAsync(projectInput);
        setIsCreateOpen(false);
        router.push(`/projects/${result.id}`);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to create project",
        );
      }
    });
  };

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  if (isLoading && !initialProjects) {
    return <ProjectsSkeleton />;
  }

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
      {projects.length > 0 ? (
        <ProjectList
          projects={projects}
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
            <p className="text-sm text-[var(--color-danger-700)]">
              {formError}
            </p>
          </div>
        )}
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={isPending || createProjectMutation.isPending}
          submitLabel="Create Project"
        />
      </Dialog>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-border)] p-4"
          >
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-4 h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
