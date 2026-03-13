"use client";

import type { Project } from "@timebeat/types";
import { useActiveProjects } from "@timebeat/hooks";
import { TimerView } from "./TimerView";

interface TimerContentProps {
  initialProjects?: Project[];
}

export function TimerContent({ initialProjects }: TimerContentProps) {
  // Use client-side data fetching for projects
  const { data: fetchedProjects } = useActiveProjects();

  // Use fetched data or initial data from server
  const projects = fetchedProjects ?? initialProjects ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Timer</h1>
        <p className="text-[var(--color-text-muted)]">
          Track your focused work sessions
        </p>
      </div>

      {/* Timer component */}
      <TimerView projects={projects} />
    </div>
  );
}
