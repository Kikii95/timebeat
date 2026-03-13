import type { Metadata } from "next";
import type { Project } from "@timebeat/types";
import { projectService } from "@/lib/services/project.service";
import { TimerView } from "./TimerView";

export const metadata: Metadata = {
  title: "Timer",
  description: "Track your time",
};

export default async function TimerPage() {
  let projects: Project[];

  try {
    projects = await projectService.getActive();
  } catch {
    projects = [];
  }

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
