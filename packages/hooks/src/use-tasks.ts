/**
 * Tasks data hooks for client-side fetching
 * Used in static export mode (desktop app)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskStatus } from "@timebeat/types";
import { getSupabaseClient } from "./supabase";

// === QUERY KEYS ===

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  byProject: (projectId: string) => [...taskKeys.lists(), { projectId }] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
  pending: () => [...taskKeys.all, "pending"] as const,
  inProgress: () => [...taskKeys.all, "in-progress"] as const,
};

// === TYPES ===

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

// === MAPPERS ===

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

function mapTaskFromDb(db: DbTask): Task {
  return {
    id: db.id,
    projectId: db.project_id,
    title: db.title,
    description: db.description,
    status: db.status as TaskStatus,
    priority: db.priority,
    estimatedMinutes: db.estimated_minutes,
    actualMinutes: db.actual_minutes,
    order: db.order,
    completedAt: db.completed_at ? new Date(db.completed_at) : null,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// === HOOKS ===

/**
 * Fetch tasks by project
 */
export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select(`*, projects!inner(user_id)`)
        .eq("project_id", projectId)
        .eq("projects.user_id", user.id)
        .order("order", { ascending: true });

      if (error) throw new Error(error.message);
      return (data as DbTask[]).map(mapTaskFromDb);
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch a single task by ID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select(`*, projects!inner(user_id)`)
        .eq("id", id)
        .eq("projects.user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }

      return mapTaskFromDb(data as DbTask);
    },
    enabled: !!id,
  });
}

/**
 * Fetch in-progress tasks
 */
export function useInProgressTasks() {
  return useQuery({
    queryKey: taskKeys.inProgress(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select(`*, projects!inner(user_id)`)
        .eq("projects.user_id", user.id)
        .eq("status", "IN_PROGRESS")
        .order("priority", { ascending: false })
        .order("order", { ascending: true });

      if (error) throw new Error(error.message);
      return (data as DbTask[]).map(mapTaskFromDb);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch pending tasks (TODO + IN_PROGRESS)
 */
export function usePendingTasks(limit = 10) {
  return useQuery({
    queryKey: taskKeys.pending(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .select(`*, projects!inner(user_id)`)
        .eq("projects.user_id", user.id)
        .in("status", ["TODO", "IN_PROGRESS"])
        .order("priority", { ascending: false })
        .order("order", { ascending: true })
        .limit(limit);

      if (error) throw new Error(error.message);
      return (data as DbTask[]).map(mapTaskFromDb);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Verify project ownership
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", user.id)
        .single();

      if (!project) throw new Error("Project not found");

      // Get max order
      const { data: maxOrderTask } = await supabase
        .from("tasks")
        .select("order")
        .eq("project_id", input.projectId)
        .order("order", { ascending: false })
        .limit(1)
        .single();

      const newOrder = input.order ?? (maxOrderTask?.order ?? 0) + 1;

      const taskData = {
        id: crypto.randomUUID(),
        project_id: input.projectId,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "TODO",
        priority: input.priority ?? 2,
        estimated_minutes: input.estimatedMinutes ?? null,
        actual_minutes: 0,
        order: newOrder,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapTaskFromDb(data as DbTask);
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(task.projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.pending() });
    },
  });
}

/**
 * Update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.estimatedMinutes !== undefined) updateData.estimated_minutes = data.estimatedMinutes;
      if (data.actualMinutes !== undefined) updateData.actual_minutes = data.actualMinutes;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.completedAt !== undefined) {
        updateData.completed_at = data.completedAt?.toISOString() ?? null;
      }

      const { data: result, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id)
        .select(`*, projects!inner(user_id)`)
        .eq("projects.user_id", user.id)
        .single();

      if (error) throw new Error(error.message);
      return mapTaskFromDb(result as DbTask);
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.setQueryData(taskKeys.detail(task.id), task);
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get task to verify ownership
      const { data: task } = await supabase
        .from("tasks")
        .select(`id, project_id, projects!inner(user_id)`)
        .eq("id", id)
        .eq("projects.user_id", user.id)
        .single();

      if (!task) throw new Error("Task not found");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
      return task.project_id;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    },
  });
}

/**
 * Complete a task
 */
export function useCompleteTask() {
  const updateTask = useUpdateTask();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateTask.mutateAsync({
        id,
        data: {
          status: "COMPLETED" as TaskStatus,
          completedAt: new Date(),
        },
      });
    },
  });
}
