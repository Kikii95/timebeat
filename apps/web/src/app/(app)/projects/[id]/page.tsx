import type { Metadata } from "next";
import { ProjectDetailContent } from "./project-detail-content";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const isStaticExport = process.env.STATIC_EXPORT === "true";

// For static export: generate a placeholder path
// Real project pages are rendered client-side
export async function generateStaticParams() {
  if (isStaticExport) {
    // Generate a placeholder - actual routing is client-side
    return [{ id: "_" }];
  }
  // In SSR mode, pages are generated on-demand
  return [];
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  // Placeholder or static export mode
  if (isStaticExport || id === "_") {
    return {
      title: "Project Details",
      description: "View project details",
    };
  }

  try {
    const { projectService } = await import("@/lib/services/project.service");
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

async function getServerData(id: string) {
  if (isStaticExport || id === "_") {
    return { project: null, stats: null };
  }

  try {
    const { projectService } = await import("@/lib/services/project.service");
    const project = await projectService.getById(id);
    if (!project) {
      return { project: null, stats: null };
    }
    const stats = await projectService.getStats(id);
    return { project, stats };
  } catch {
    return { project: null, stats: null };
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const { project, stats } = await getServerData(id);

  return (
    <ProjectDetailContent
      projectId={id}
      initialProject={project}
      initialStats={stats}
    />
  );
}
