"use server";

import { revalidatePath } from "next/cache";
import { taskService } from "@/lib/services/task.service";
import type { TaskStatus } from "@timebeat/types";

// === RESPONSE TYPES ===

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// === SERVER ACTIONS ===

/**
 * Create a new task
 */
export async function createTask(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const projectId = formData.get("projectId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const priority = formData.get("priority") as string | null;
    const estimatedMinutes = formData.get("estimatedMinutes") as string | null;

    if (!projectId || !title) {
      return { success: false, error: "Project and title are required" };
    }

    const task = await taskService.create({
      projectId,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority ? parseInt(priority, 10) : undefined,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: { id: task.id } };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const status = formData.get("status") as TaskStatus | null;
    const priority = formData.get("priority") as string | null;
    const estimatedMinutes = formData.get("estimatedMinutes") as string | null;

    const task = await taskService.update(id, {
      title: title?.trim() || undefined,
      description: description !== null ? description.trim() || null : undefined,
      status: status ?? undefined,
      priority: priority !== null ? parseInt(priority, 10) : undefined,
      estimatedMinutes:
        estimatedMinutes !== null
          ? estimatedMinutes
            ? parseInt(estimatedMinutes, 10)
            : null
          : undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${task.projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  id: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await taskService.delete(id);

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

/**
 * Complete a task
 */
export async function completeTask(
  id: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await taskService.complete(id);

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to complete task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete task",
    };
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  projectId: string
): Promise<ActionResult> {
  try {
    await taskService.update(id, {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update task status",
    };
  }
}
