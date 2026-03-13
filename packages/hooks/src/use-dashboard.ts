/**
 * Dashboard data hooks for client-side fetching
 * Aggregates stats from projects, sessions, and tasks
 */

import { useQuery } from "@tanstack/react-query";
import type { Project, Session } from "@timebeat/types";
import { getSupabaseClient } from "./supabase";

// === QUERY KEYS ===

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  weekData: () => [...dashboardKeys.all, "week"] as const,
  monthData: () => [...dashboardKeys.all, "month"] as const,
};

// === TYPES ===

export interface DashboardStats {
  todaySessions: Session[];
  todaySeconds: number;
  weekSessions: Session[];
  weekSeconds: number;
  monthSessions: Session[];
  monthSeconds: number;
  activeProjects: Project[];
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
  created_at: string;
  updated_at: string;
  last_session_at: string | null;
}

function mapSessionFromDb(db: DbSession): Session {
  return {
    id: db.id,
    userId: db.user_id,
    projectId: db.project_id,
    taskId: db.task_id,
    type: db.type as Session["type"],
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

function mapProjectFromDb(db: DbProject): Project {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    description: db.description,
    type: db.type as Project["type"],
    status: db.status as Project["status"],
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
 * Fetch all dashboard data in one go
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();

      // Calculate date boundaries
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch all data in parallel
      const [todayResult, weekResult, monthResult, projectsResult] = await Promise.all([
        // Today's sessions
        supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("started_at", todayStart.toISOString())
          .order("started_at", { ascending: false }),
        // This week's sessions
        supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("started_at", weekStart.toISOString())
          .order("started_at", { ascending: false }),
        // This month's sessions
        supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("started_at", monthStart.toISOString())
          .order("started_at", { ascending: false }),
        // Active projects
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "ACTIVE")
          .order("updated_at", { ascending: false }),
      ]);

      // Handle errors
      if (todayResult.error) throw new Error(todayResult.error.message);
      if (weekResult.error) throw new Error(weekResult.error.message);
      if (monthResult.error) throw new Error(monthResult.error.message);
      if (projectsResult.error) throw new Error(projectsResult.error.message);

      // Map data
      const todaySessions = (todayResult.data as DbSession[]).map(mapSessionFromDb);
      const weekSessions = (weekResult.data as DbSession[]).map(mapSessionFromDb);
      const monthSessions = (monthResult.data as DbSession[]).map(mapSessionFromDb);
      const activeProjects = (projectsResult.data as DbProject[]).map(mapProjectFromDb);

      // Calculate totals
      const todaySeconds = todaySessions.reduce((sum, s) => sum + s.totalSeconds, 0);
      const weekSeconds = weekSessions.reduce((sum, s) => sum + s.totalSeconds, 0);
      const monthSeconds = monthSessions.reduce((sum, s) => sum + s.totalSeconds, 0);

      return {
        todaySessions,
        todaySeconds,
        weekSessions,
        weekSeconds,
        monthSessions,
        monthSeconds,
        activeProjects,
      };
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Hook for current user info
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw new Error(error.message);
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}
