/**
 * Task Service Layer
 * Handles all task-related database operations
 */

import { createClient } from "../supabase/server";
import type { Task, TaskStatus } from "@timebeat/types";

// === CONSTANTS ===

const TASK_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

// === INPUT TYPES ===

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: number;
  estimatedMinutes?: number | null;
  order?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: number;
  estimatedMinutes?: number | null;
  actualMinutes?: number;
  order?: number;
  completedAt?: Date | null;
}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
}

// === SERVICE ===

export const taskService = {
  /**
   * Create a new task
   */
  async create(data: CreateTaskInput): Promise<Task> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", data.projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      throw new Error("Project not found");
    }

    // Get max order for this project
    const { data: maxOrderTask } = await supabase
      .from("tasks")
      .select("order")
      .eq("project_id", data.projectId)
      .order("order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = data.order ?? (maxOrderTask?.order ?? 0) + 1;

    const taskData = {
      id: crypto.randomUUID(),
      project_id: data.projectId,
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "TODO",
      priority: data.priority ?? TASK_PRIORITY.MEDIUM,
      estimated_minutes: data.estimatedMinutes ?? null,
      actual_minutes: 0,
      order: newOrder,
    };

    const { data: task, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return mapTaskFromDb(task);
  },

  /**
   * Update an existing task
   */
  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.estimatedMinutes !== undefined) {
      updateData.estimated_minutes = data.estimatedMinutes;
    }
    if (data.actualMinutes !== undefined) {
      updateData.actual_minutes = data.actualMinutes;
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }
    if (data.completedAt !== undefined) {
      updateData.completed_at = data.completedAt?.toISOString() ?? null;
    }

    // Join with projects to verify ownership
    const { data: task, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("projects.user_id", user.id)
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return mapTaskFromDb(task);
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // First get the task to verify ownership
    const { data: task } = await supabase
      .from("tasks")
      .select(
        `
        id,
        projects!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("projects.user_id", user.id)
      .single();

    if (!task) {
      throw new Error("Task not found");
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  },

  /**
   * Complete a task
   */
  async complete(id: string): Promise<Task> {
    return this.update(id, {
      status: "COMPLETED" as TaskStatus,
      completedAt: new Date(),
    });
  },

  /**
   * Get a task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("projects.user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get task: ${error.message}`);
    }

    return mapTaskFromDb(task);
  },

  /**
   * Get tasks by project
   */
  async getByProject(projectId: string): Promise<Task[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("project_id", projectId)
      .eq("projects.user_id", user.id)
      .order("order", { ascending: true });

    if (error) {
      throw new Error(`Failed to get tasks: ${error.message}`);
    }

    return tasks.map(mapTaskFromDb);
  },

  /**
   * Get in-progress tasks
   */
  async getInProgress(): Promise<Task[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("projects.user_id", user.id)
      .eq("status", "IN_PROGRESS")
      .order("priority", { ascending: false })
      .order("order", { ascending: true });

    if (error) {
      throw new Error(`Failed to get in-progress tasks: ${error.message}`);
    }

    return tasks.map(mapTaskFromDb);
  },

  /**
   * Get pending tasks (TODO + IN_PROGRESS)
   */
  async getPending(): Promise<Task[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects!inner(user_id)
      `
      )
      .eq("projects.user_id", user.id)
      .in("status", ["TODO", "IN_PROGRESS"])
      .order("priority", { ascending: false })
      .order("order", { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Failed to get pending tasks: ${error.message}`);
    }

    return tasks.map(mapTaskFromDb);
  },
};

// === HELPERS ===

interface DbTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  estimated_minutes: number | null;
  actual_minutes: number;
  order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapTaskFromDb(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    projectId: dbTask.project_id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as TaskStatus,
    priority: dbTask.priority,
    estimatedMinutes: dbTask.estimated_minutes,
    actualMinutes: dbTask.actual_minutes,
    order: dbTask.order,
    completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : null,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
  };
}
