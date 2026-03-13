/**
 * Session Service Layer
 * Handles all session-related database operations
 */

import { createClient } from "../supabase/server";
import type { Session, SessionType } from "@timebeat/types";

// === INPUT TYPES ===

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

export interface SessionFilters {
  projectId?: string;
  taskId?: string;
  startDate?: Date;
  endDate?: Date;
}

// === SERVICE ===

export const sessionService = {
  /**
   * Create a new session
   */
  async create(data: CreateSessionInput): Promise<Session> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const sessionData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      project_id: data.projectId,
      task_id: data.taskId ?? null,
      type: data.type ?? "FREE",
      planned_minutes: data.plannedMinutes ?? null,
      started_at: data.startedAt.toISOString(),
      ended_at: data.endedAt?.toISOString() ?? null,
      total_seconds: data.totalSeconds,
      paused_seconds: data.pausedSeconds ?? 0,
      notes: data.notes ?? null,
    };

    const { data: session, error } = await supabase
      .from("sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    // Update project stats
    await updateProjectStats(supabase, data.projectId, data.totalSeconds);

    return mapSessionFromDb(session);
  },

  /**
   * Update an existing session
   */
  async update(id: string, data: UpdateSessionInput): Promise<Session> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

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

    const { data: session, error } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return mapSessionFromDb(session);
  },

  /**
   * Get sessions by project
   */
  async getByProject(projectId: string, limit = 10): Promise<Session[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select()
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return sessions.map(mapSessionFromDb);
  },

  /**
   * Get today's sessions
   */
  async getToday(): Promise<Session[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select()
      .eq("user_id", user.id)
      .gte("started_at", today.toISOString())
      .lt("started_at", tomorrow.toISOString())
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get today's sessions: ${error.message}`);
    }

    return sessions.map(mapSessionFromDb);
  },

  /**
   * Get sessions by date range
   */
  async getByDateRange(start: Date, end: Date): Promise<Session[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select()
      .eq("user_id", user.id)
      .gte("started_at", start.toISOString())
      .lt("started_at", end.toISOString())
      .order("started_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return sessions.map(mapSessionFromDb);
  },

  /**
   * Get total time tracked today
   */
  async getTodayTotal(): Promise<number> {
    const sessions = await this.getToday();
    return sessions.reduce((total, s) => total + s.totalSeconds, 0);
  },
};

// === HELPERS ===

async function updateProjectStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  additionalSeconds: number,
) {
  // Get current stats
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

function mapSessionFromDb(dbSession: DbSession): Session {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    projectId: dbSession.project_id,
    taskId: dbSession.task_id,
    type: dbSession.type as SessionType,
    plannedMinutes: dbSession.planned_minutes,
    startedAt: new Date(dbSession.started_at),
    endedAt: dbSession.ended_at ? new Date(dbSession.ended_at) : null,
    totalSeconds: dbSession.total_seconds,
    pausedSeconds: dbSession.paused_seconds,
    notes: dbSession.notes,
    createdAt: new Date(dbSession.created_at),
    updatedAt: new Date(dbSession.updated_at),
  };
}
