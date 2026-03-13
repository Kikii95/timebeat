/**
 * Projects data hooks for client-side fetching
 * Used in static export mode (desktop app)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Project,
  ProjectType,
  ProjectStatus,
} from "@timebeat/types";
import { getSupabaseClient } from "./supabase";

// === QUERY KEYS ===

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.detail(id), "stats"] as const,
  active: () => [...projectKeys.all, "active"] as const,
};

// === TYPES ===

export interface ProjectFilters {
  status?: ProjectStatus;
  type?: ProjectType;
  search?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  type?: ProjectType;
  color?: string;
  icon?: string | null;
  stack?: string[];
  platform?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  type?: ProjectType;
  status?: ProjectStatus;
  color?: string;
  icon?: string | null;
  stack?: string[];
  platform?: string[];
}

export interface ProjectStats {
  totalTimeSeconds: number;
  sessionCount: number;
  taskCount: number;
  completedTasks: number;
  lastSessionAt: Date | null;
}

// === MAPPERS ===

interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  color: string;
  icon: string | null;
  stack: string[];
  platform: string[];
  total_time_seconds: number;
  session_count: number;
  task_count: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
  last_session_at: string | null;
}

function mapProjectFromDb(db: DbProject): Project {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    description: db.description,
    type: db.type as ProjectType,
    status: db.status as ProjectStatus,
    color: db.color,
    icon: db.icon,
    stack: db.stack,
    platform: db.platform,
    totalTimeSeconds: db.total_time_seconds,
    sessionCount: db.session_count,
    lastSessionAt: db.last_session_at ? new Date(db.last_session_at) : null,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// === HOOKS ===

/**
 * Fetch all projects with optional filters
 */
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return (data as DbProject[]).map(mapProjectFromDb);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch active (non-archived) projects
 */
export function useActiveProjects() {
  return useProjects({ status: "ACTIVE" as ProjectStatus });
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }

      return mapProjectFromDb(data as DbProject);
    },
    enabled: !!id,
  });
}

/**
 * Fetch project stats
 */
export function useProjectStats(id: string) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: async (): Promise<ProjectStats> => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select("total_time_seconds, session_count, task_count, completed_tasks, last_session_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw new Error(error.message);

      return {
        totalTimeSeconds: data.total_time_seconds,
        sessionCount: data.session_count,
        taskCount: data.task_count,
        completedTasks: data.completed_tasks,
        lastSessionAt: data.last_session_at ? new Date(data.last_session_at) : null,
      };
    },
    enabled: !!id,
  });
}

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectData = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: input.name,
        description: input.description ?? null,
        type: input.type ?? "PERSONAL",
        status: "ACTIVE",
        color: input.color ?? "#4ECDC4",
        icon: input.icon ?? null,
        stack: input.stack ?? [],
        platform: input.platform ?? [],
        total_time_seconds: 0,
        session_count: 0,
        task_count: 0,
        completed_tasks: 0,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapProjectFromDb(data as DbProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/**
 * Update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.stack !== undefined) updateData.stack = data.stack;
      if (data.platform !== undefined) updateData.platform = data.platform;

      const { data: result, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapProjectFromDb(result as DbProject);
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
    },
  });
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/**
 * Archive a project
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .update({ status: "ARCHIVED", archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapProjectFromDb(data as DbProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
