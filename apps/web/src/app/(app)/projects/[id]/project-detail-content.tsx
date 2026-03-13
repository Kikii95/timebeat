"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@timebeat/types";
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
  StatsCard,
} from "@timebeat/ui";
import {
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
} from "@/app/actions/projects";
import type { ProjectStats } from "@/lib/services/project.service";

interface ProjectDetailContentProps {
  project: Project;
  stats: ProjectStats;
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
  project,
  stats,
}: ProjectDetailContentProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdateProject = async (formData: FormData) => {
    setFormError(null);

    startTransition(async () => {
      const result = await updateProject(project.id, formData);

      if (result.success) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        setFormError(result.error ?? "Failed to update project");
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveProject(project.id);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreProject(project.id);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result.success) {
        router.push("/projects");
      }
    });
  };

  const isArchived = project.status === "ARCHIVED";

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
              disabled={isPending}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleArchive}
              disabled={isPending}
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
          value={formatDuration(stats.totalTimeSeconds)}
          icon="⏱️"
        />
        <StatsCard
          title="Sessions"
          value={stats.sessionCount.toString()}
          icon="🎯"
        />
        <StatsCard
          title="Tasks"
          value={`${stats.completedTasks}/${stats.taskCount}`}
          icon="✅"
          description={
            stats.taskCount > 0
              ? `${Math.round((stats.completedTasks / stats.taskCount) * 100)}% completed`
              : undefined
          }
        />
        <StatsCard
          title="Last Session"
          value={
            stats.lastSessionAt
              ? new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(stats.lastSessionAt)
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
          isSubmitting={isPending}
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isPending}>
              Delete Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
