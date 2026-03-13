"use client";

import Link from "next/link";
import { formatDuration } from "@timebeat/utils";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@timebeat/ui";
import type { Project, Session } from "@timebeat/types";
import { WeeklyChart, ProjectsChart } from "@/components/charts";
import {
  useDashboardStats,
  useCurrentUser,
  type DashboardStats,
} from "@timebeat/hooks";

// === TYPES ===

interface DashboardContentProps {
  initialStats?: DashboardStats | null;
}

// === MAIN COMPONENT ===

export function DashboardContent({ initialStats }: DashboardContentProps) {
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading } = useDashboardStats();

  // Use initial data (from server) or fetched data (client)
  const data = stats ?? initialStats;

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const todaySessions = data?.todaySessions ?? [];
  const todaySeconds = data?.todaySeconds ?? 0;
  const weekSessions = data?.weekSessions ?? [];
  const weekSeconds = data?.weekSeconds ?? 0;
  const monthSessions = data?.monthSessions ?? [];
  const monthSeconds = data?.monthSeconds ?? 0;
  const projects = data?.activeProjects ?? [];

  const recentSessions = todaySessions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[var(--color-text-muted)]">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today"
          value={formatDuration(todaySeconds)}
          subtitle={`${todaySessions.length} session${todaySessions.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          title="This Week"
          value={formatDuration(weekSeconds)}
          subtitle={`${weekSessions.length} session${weekSessions.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          title="This Month"
          value={formatDuration(monthSeconds)}
          subtitle={`${monthSessions.length} session${monthSessions.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          title="Active Projects"
          value={String(projects.length)}
          subtitle="projects tracked"
        />
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <QuickAction href="/timer" icon="⏱️" label="Start Timer" primary />
            <QuickAction href="/projects" icon="📁" label="View Projects" />
          </div>
        </CardContent>
      </Card>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart sessions={weekSessions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsChart sessions={weekSessions} projects={projects} />
          </CardContent>
        </Card>
      </div>

      {/* Two column layout for recent data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sessions</CardTitle>
              {recentSessions.length > 0 && (
                <Link
                  href="/timer"
                  className="text-sm text-[var(--color-primary-500)] hover:underline"
                >
                  View all →
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const project = projects.find(
                    (p) => p.id === session.projectId,
                  );
                  return (
                    <SessionRow
                      key={session.id}
                      session={session}
                      projectName={project?.name}
                      projectColor={project?.color}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                message="No sessions yet"
                hint="Start tracking to see your sessions here"
              />
            )}
          </CardContent>
        </Card>

        {/* Active projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Projects</CardTitle>
              <Link
                href="/projects"
                className="text-sm text-[var(--color-primary-500)] hover:underline"
              >
                Manage →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="No active projects"
                hint="Create a project to start organizing your time"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// === SKELETON ===

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-2 h-8 w-24" />
              <Skeleton className="mt-1 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-6 w-32" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// === SUB-COMPONENTS ===

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  icon,
  label,
  primary,
}: {
  href: string;
  icon: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        primary
          ? "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]"
          : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function SessionRow({
  session,
  projectName,
  projectColor,
}: {
  session: Session;
  projectName?: string;
  projectColor?: string | null;
}) {
  const startTime = new Date(session.startedAt);

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: projectColor ?? "#888" }}
        />
        <div>
          <p className="text-sm font-medium">{projectName ?? "Unknown"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <p className="font-mono text-sm">
        {formatDuration(session.totalSeconds)}
      </p>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-surface-hover)]"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded"
          style={{ backgroundColor: project.color ?? "#888" }}
        />
        <div>
          <p className="text-sm font-medium">{project.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {project.sessionCount} session
            {project.sessionCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <p className="font-mono text-sm text-[var(--color-text-muted)]">
        {formatDuration(project.totalTimeSeconds)}
      </p>
    </Link>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-[var(--color-text-muted)]">{message}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}
