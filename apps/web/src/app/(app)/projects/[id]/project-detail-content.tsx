"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectStatus, type Project } from "@timebeat/types";
import { formatDuration } from "@timebeat/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  ProjectForm,
  Skeleton,
  StatsCard,
} from "@timebeat/ui";
import {
  useProject,
  useProjectStats,
  useUpdateProject,
  useArchiveProject,
  useDeleteProject,
  type UpdateProjectInput,
  type ProjectStats,
} from "@timebeat/hooks";

interface ProjectDetailContentProps {
  projectId: string;
  initialProject?: Project | null;
  initialStats?: ProjectStats | null;
}

const statusColors: Record<
  string,
  "success" | "warning" | "primary" | "secondary"
> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "primary",
  ARCHIVED: "secondary",
};

export function ProjectDetailContent({
  projectId,
  initialProject,
  initialStats,
}: ProjectDetailContentProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Use client-side data fetching
  const { data: fetchedProject, isLoading: projectLoading } = useProject(projectId);
  const { data: fetchedStats, isLoading: statsLoading } = useProjectStats(projectId);
  const updateMutation = useUpdateProject();
  const archiveMutation = useArchiveProject();
  const deleteMutation = useDeleteProject();

  // Use fetched data or initial data from server
  const project = fetchedProject ?? initialProject;
  const stats = fetchedStats ?? initialStats;

  const isLoading = (projectLoading || statsLoading) && !initialProject;

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <nav className="text-sm text-[var(--color-text-muted)]">
          <Link
            href="/projects"
            className="hover:text-[var(--color-primary-500)]"
          >
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Not Found</span>
        </nav>
        <div className="rounded-lg border border-[var(--color-border)] p-8 text-center">
          <h2 className="text-lg font-medium">Project not found</h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            This project may have been deleted or you don&apos;t have access.
          </p>
          <Button className="mt-4" onClick={() => router.push("/projects")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateProject = async (formData: FormData) => {
    setFormError(null);

    const updateData: UpdateProjectInput = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      type: formData.get("type") as UpdateProjectInput["type"],
      color: formData.get("color") as string,
      icon: (formData.get("icon") as string) || undefined,
    };

    startTransition(async () => {
      try {
        await updateMutation.mutateAsync({ id: project.id, data: updateData });
        setIsEditOpen(false);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to update project",
        );
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveMutation.mutateAsync(project.id);
      } catch (err) {
        console.error("Failed to archive project:", err);
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await updateMutation.mutateAsync({
          id: project.id,
          data: { status: ProjectStatus.ACTIVE },
        });
      } catch (err) {
        console.error("Failed to restore project:", err);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteMutation.mutateAsync(project.id);
        router.push("/projects");
      } catch (err) {
        console.error("Failed to delete project:", err);
      }
    });
  };

  const isArchived = project.status === "ARCHIVED";
  const isMutating =
    isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-muted)]">
        <Link
          href="/projects"
          className="hover:text-[var(--color-primary-500)]"
        >
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
            style={{
              backgroundColor: project.color + "20",
              color: project.color,
            }}
          >
            {project.icon || project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge variant={statusColors[project.status]}>
                {project.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
            {project.description && (
              <p className="mt-1 text-[var(--color-text-muted)]">
                {project.description}
              </p>
            )}
            <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
              {project.type.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          {isArchived ? (
            <Button
              variant="secondary"
              onClick={handleRestore}
              disabled={isMutating}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleArchive}
              disabled={isMutating}
            >
              Archive
            </Button>
          )}
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Time"
          value={formatDuration(stats?.totalTimeSeconds ?? 0)}
          icon="⏱️"
        />
        <StatsCard
          title="Sessions"
          value={(stats?.sessionCount ?? 0).toString()}
          icon="🎯"
        />
        <StatsCard
          title="Tasks"
          value={`${stats?.completedTasks ?? 0}/${stats?.taskCount ?? 0}`}
          icon="✅"
          description={
            stats?.taskCount && stats.taskCount > 0
              ? `${Math.round((stats.completedTasks / stats.taskCount) * 100)}% completed`
              : undefined
          }
        />
        <StatsCard
          title="Last Session"
          value={
            stats?.lastSessionAt
              ? new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(stats.lastSessionAt))
              : "Never"
          }
          icon="📅"
        />
      </div>

      {/* Metadata */}
      {(project.stack.length > 0 || project.platform.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.stack.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-muted)]">
                  Tech Stack
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project.platform.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-muted)]">
                  Platforms
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.platform.map((p) => (
                    <Badge key={p} variant="outline">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sessions placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
            <p className="text-[var(--color-text-muted)]">
              No sessions yet. Start tracking time with the timer!
            </p>
            <Button className="mt-4" onClick={() => router.push("/timer")}>
              Go to Timer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project"
        description="Update your project details"
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] p-3">
            <p className="text-sm text-[var(--color-danger-700)]">
              {formError}
            </p>
          </div>
        )}
        <ProjectForm
          project={project}
          onSubmit={handleUpdateProject}
          onCancel={() => setIsEditOpen(false)}
          isSubmitting={isMutating}
          submitLabel="Save Changes"
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            This will permanently delete &quot;{project.name}&quot; and all
            associated sessions and tasks.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isMutating}>
              Delete Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-5 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
