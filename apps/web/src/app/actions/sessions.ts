"use server";

import { revalidatePath } from "next/cache";
import { sessionService } from "@/lib/services/session.service";
import type { SessionType } from "@timebeat/types";

// === RESPONSE TYPES ===

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// === SERVER ACTIONS ===

/**
 * Save a completed session
 */
export async function saveSession(data: {
  projectId: string;
  taskId?: string | null;
  type?: SessionType;
  plannedMinutes?: number | null;
  startedAt: string; // ISO string
  endedAt: string; // ISO string
  totalSeconds: number;
  pausedSeconds?: number;
  notes?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.projectId) {
      return { success: false, error: "Project ID is required" };
    }

    if (data.totalSeconds < 0) {
      return { success: false, error: "Invalid session duration" };
    }

    const session = await sessionService.create({
      projectId: data.projectId,
      taskId: data.taskId ?? null,
      type: data.type,
      plannedMinutes: data.plannedMinutes ?? null,
      startedAt: new Date(data.startedAt),
      endedAt: new Date(data.endedAt),
      totalSeconds: data.totalSeconds,
      pausedSeconds: data.pausedSeconds ?? 0,
      notes: data.notes ?? null,
    });

    revalidatePath("/dashboard");
    revalidatePath("/timer");
    revalidatePath(`/projects/${data.projectId}`);

    return { success: true, data: { id: session.id } };
  } catch (error) {
    console.error("Failed to save session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save session",
    };
  }
}

/**
 * Get today's sessions
 */
export async function getTodaySessions(): Promise<
  ActionResult<{
    sessions: Array<{
      id: string;
      projectId: string;
      totalSeconds: number;
      startedAt: string;
    }>;
    totalSeconds: number;
  }>
> {
  try {
    const sessions = await sessionService.getToday();

    const mapped = sessions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      totalSeconds: s.totalSeconds,
      startedAt: s.startedAt.toISOString(),
    }));

    const totalSeconds = sessions.reduce((sum, s) => sum + s.totalSeconds, 0);

    return {
      success: true,
      data: { sessions: mapped, totalSeconds },
    };
  } catch (error) {
    console.error("Failed to get today's sessions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get sessions",
    };
  }
}
