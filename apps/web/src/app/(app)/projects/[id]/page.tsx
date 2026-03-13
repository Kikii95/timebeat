import type { Metadata } from "next";
import { ProjectDetailContent } from "./project-detail-content";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const isStaticExport = process.env.STATIC_EXPORT === "true";

// Required for static export - pages will be generated on-demand client-side
export async function generateStaticParams() {
  // Return empty array for static export
  // Pages will be rendered client-side in desktop app
  return [];
}

// Allow dynamic params for client-side routing
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  // In static export mode, use generic metadata
  if (isStaticExport) {
    return {
      title: "Project Details",
      description: "View project details",
    };
  }

  const { id } = await params;

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
  if (isStaticExport) {
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
