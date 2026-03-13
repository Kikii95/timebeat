import type { Metadata } from "next";
import type { Project } from "@timebeat/types";
import { ProjectsContent } from "./projects-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your projects",
};

const isStaticExport = process.env.STATIC_EXPORT === "true";

async function getServerData(): Promise<{
  projects: Project[];
  error: string | null;
}> {
  if (isStaticExport) {
    return { projects: [], error: null };
  }

  try {
    const { projectService } = await import("@/lib/services/project.service");
    const projects = await projectService.getAll();
    return { projects, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to load projects";
    return { projects: [], error };
  }
}

export default async function ProjectsPage() {
  const { projects, error } = await getServerData();

  return <ProjectsContent initialProjects={projects} error={error} />;
}
