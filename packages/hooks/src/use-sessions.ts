/**
 * Sessions data hooks for client-side fetching
 * Used in static export mode (desktop app)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session, SessionType } from "@timebeat/types";
import { getSupabaseClient } from "./supabase";
import { projectKeys } from "./use-projects";

// === QUERY KEYS ===

export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  byProject: (projectId: string) => [...sessionKeys.lists(), { projectId }] as const,
  today: () => [...sessionKeys.all, "today"] as const,
  dateRange: (start: Date, end: Date) => [...sessionKeys.all, "range", start.toISOString(), end.toISOString()] as const,
};

// === TYPES ===

export interface CreateSessionInput {
  projectId: string;
  taskId?: string | null;
  type?: SessionType;
  plannedMinutes?: number | null;
  startedAt: Date;
  endedAt?: Date | null;
  totalSeconds: number;
  pausedSeconds?: number;
  notes?: string | null;
}

export interface UpdateSessionInput {
  endedAt?: Date | null;
  totalSeconds?: number;
  pausedSeconds?: number;
  notes?: string | null;
}

// === MAPPERS ===

interface DbSession {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  type: string;
  planned_minutes: number | null;
  started_at: string;
  ended_at: string | null;
  total_seconds: number;
  paused_seconds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapSessionFromDb(db: DbSession): Session {
  return {
    id: db.id,
    userId: db.user_id,
    projectId: db.project_id,
    taskId: db.task_id,
    type: db.type as SessionType,
    plannedMinutes: db.planned_minutes,
    startedAt: new Date(db.started_at),
    endedAt: db.ended_at ? new Date(db.ended_at) : null,
    totalSeconds: db.total_seconds,
    pausedSeconds: db.paused_seconds,
    notes: db.notes,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// === HOOKS ===

/**
 * Fetch sessions by project
 */
export function useSessionsByProject(projectId: string, limit = 10) {
  return useQuery({
    queryKey: sessionKeys.byProject(projectId),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return (data as DbSession[]).map(mapSessionFromDb);
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch today's sessions
 */
export function useTodaySessions() {
  return useQuery({
    queryKey: sessionKeys.today(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("started_at", today.toISOString())
        .lt("started_at", tomorrow.toISOString())
        .order("started_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as DbSession[]).map(mapSessionFromDb);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch sessions by date range
 */
export function useSessionsByDateRange(start: Date, end: Date) {
  return useQuery({
    queryKey: sessionKeys.dateRange(start, end),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("started_at", start.toISOString())
        .lt("started_at", end.toISOString())
        .order("started_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as DbSession[]).map(mapSessionFromDb);
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const sessionData = {
        id: crypto.randomUUID(),
        user_id: user.id,
        project_id: input.projectId,
        task_id: input.taskId ?? null,
        type: input.type ?? "FREE",
        planned_minutes: input.plannedMinutes ?? null,
        started_at: input.startedAt.toISOString(),
        ended_at: input.endedAt?.toISOString() ?? null,
        total_seconds: input.totalSeconds,
        paused_seconds: input.pausedSeconds ?? 0,
        notes: input.notes ?? null,
      };

      const { data, error } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Update project stats
      await updateProjectStats(supabase, input.projectId, input.totalSeconds);

      return mapSessionFromDb(data as DbSession);
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(session.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats(session.projectId) });
    },
  });
}

/**
 * Update a session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSessionInput }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {};
      if (data.endedAt !== undefined) {
        updateData.ended_at = data.endedAt?.toISOString() ?? null;
      }
      if (data.totalSeconds !== undefined) {
        updateData.total_seconds = data.totalSeconds;
      }
      if (data.pausedSeconds !== undefined) {
        updateData.paused_seconds = data.pausedSeconds;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      const { data: result, error } = await supabase
        .from("sessions")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapSessionFromDb(result as DbSession);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

// === HELPERS ===

async function updateProjectStats(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  projectId: string,
  additionalSeconds: number,
) {
  const { data: project } = await supabase
    .from("projects")
    .select("total_time_seconds, session_count")
    .eq("id", projectId)
    .single();

  if (project) {
    await supabase
      .from("projects")
      .update({
        total_time_seconds: project.total_time_seconds + additionalSeconds,
        session_count: project.session_count + 1,
        last_session_at: new Date().toISOString(),
      })
      .eq("id", projectId);
  }
}
