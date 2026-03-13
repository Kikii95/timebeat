import type { Metadata } from "next";
import { TimerContent } from "./timer-content";

export const metadata: Metadata = {
  title: "Timer",
  description: "Track your time",
};

const isStaticExport = process.env.STATIC_EXPORT === "true";

async function getServerData() {
  if (isStaticExport) {
    return { projects: [] };
  }

  try {
    const { projectService } = await import("@/lib/services/project.service");
    const projects = await projectService.getActive();
    return { projects };
  } catch {
    return { projects: [] };
  }
}

export default async function TimerPage() {
  const { projects } = await getServerData();

  return <TimerContent initialProjects={projects} />;
}
