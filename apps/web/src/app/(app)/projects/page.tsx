import type { Metadata } from "next";
import type { Project } from "@timebeat/types";
import { projectService } from "@/lib/services/project.service";
import { ProjectsContent } from "./projects-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your projects",
};

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let error: string | null = null;

  try {
    projects = await projectService.getAll();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load projects";
  }

  return <ProjectsContent initialProjects={projects} error={error} />;
}
