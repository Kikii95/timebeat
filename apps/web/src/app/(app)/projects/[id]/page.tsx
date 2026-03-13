import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectService } from "@/lib/services/project.service";
import { ProjectDetailContent } from "./project-detail-content";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const project = await projectService.getById(id);
    if (!project) {
      return { title: "Project Not Found" };
    }
    return {
      title: project.name,
      description: project.description ?? `Details for ${project.name}`,
    };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  let project;
  let stats;

  try {
    project = await projectService.getById(id);
    if (!project) {
      notFound();
    }
    stats = await projectService.getStats(id);
  } catch {
    notFound();
  }

  return <ProjectDetailContent project={project} stats={stats} />;
}
