"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectService } from "@/lib/services/project.service";
import type { ProjectType, ProjectStatus } from "@timebeat/types";

// === RESPONSE TYPES ===

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// === SERVER ACTIONS ===

/**
 * Create a new project
 */
export async function createProject(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as ProjectType | null;
    const color = formData.get("color") as string | null;
    const icon = formData.get("icon") as string | null;
    const stackRaw = formData.get("stack") as string | null;
    const platformRaw = formData.get("platform") as string | null;

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Project name is required" };
    }

    if (name.length > 100) {
      return { success: false, error: "Project name must be less than 100 characters" };
    }

    const stack = stackRaw ? stackRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const platform = platformRaw ? platformRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const project = await projectService.create({
      name: name.trim(),
      description: description?.trim() || null,
      type: type || undefined,
      color: color || undefined,
      icon: icon?.trim() || null,
      stack,
      platform,
    });

    revalidatePath("/projects");

    return { success: true, data: { id: project.id } };
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as ProjectType | null;
    const status = formData.get("status") as ProjectStatus | null;
    const color = formData.get("color") as string | null;
    const icon = formData.get("icon") as string | null;
    const stackRaw = formData.get("stack") as string | null;
    const platformRaw = formData.get("platform") as string | null;

    if (name !== null && name.trim().length === 0) {
      return { success: false, error: "Project name cannot be empty" };
    }

    if (name && name.length > 100) {
      return { success: false, error: "Project name must be less than 100 characters" };
    }

    const updateData: Record<string, unknown> = {};
    if (name !== null) updateData.name = name.trim();
    if (description !== null) updateData.description = description.trim() || null;
    if (type !== null) updateData.type = type;
    if (status !== null) updateData.status = status;
    if (color !== null) updateData.color = color;
    if (icon !== null) updateData.icon = icon.trim() || null;
    if (stackRaw !== null) {
      updateData.stack = stackRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (platformRaw !== null) {
      updateData.platform = platformRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }

    await projectService.update(id, updateData);

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

/**
 * Delete a project permanently
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await projectService.delete(id);

    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

/**
 * Archive a project (soft delete)
 */
export async function archiveProject(id: string): Promise<ActionResult> {
  try {
    await projectService.archive(id);

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to archive project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive project",
    };
  }
}

/**
 * Restore an archived project
 */
export async function restoreProject(id: string): Promise<ActionResult> {
  try {
    await projectService.restore(id);

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to restore project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore project",
    };
  }
}

/**
 * Create project and redirect to detail page
 */
export async function createProjectAndRedirect(formData: FormData): Promise<void> {
  const result = await createProject(formData);

  if (result.success && result.data?.id) {
    redirect(`/projects/${result.data.id}`);
  }
}
