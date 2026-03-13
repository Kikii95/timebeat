/**
 * Settings data hooks for client-side fetching
 * Used in static export mode (desktop app)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSettings } from "@timebeat/types";
import { getSupabaseClient } from "./supabase";

// === QUERY KEYS ===

export const settingsKeys = {
  all: ["settings"] as const,
  user: () => [...settingsKeys.all, "user"] as const,
};

// === TYPES ===

export interface UpdateSettingsInput {
  pomodoroWorkMinutes?: number;
  pomodoroBreakMinutes?: number;
  pomodoroLongBreakMinutes?: number;
  pomodoroSessionsUntilLongBreak?: number;
  enableNotifications?: boolean;
  enableSounds?: boolean;
  theme?: "light" | "dark" | "system";
}

// === DEFAULTS ===

const DEFAULT_SETTINGS: Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt"> = {
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsUntilLongBreak: 4,
  enableNotifications: true,
  enableSounds: true,
  theme: "system",
};

// === MAPPERS ===

interface DbUserSettings {
  id: string;
  user_id: string;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  pomodoro_long_break_minutes: number;
  pomodoro_sessions_until_long_break: number;
  enable_notifications: boolean;
  enable_sounds: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

function mapSettingsFromDb(db: DbUserSettings): UserSettings {
  return {
    id: db.id,
    userId: db.user_id,
    pomodoroWorkMinutes: db.pomodoro_work_minutes,
    pomodoroBreakMinutes: db.pomodoro_break_minutes,
    pomodoroLongBreakMinutes: db.pomodoro_long_break_minutes,
    pomodoroSessionsUntilLongBreak: db.pomodoro_sessions_until_long_break,
    enableNotifications: db.enable_notifications,
    enableSounds: db.enable_sounds,
    theme: db.theme as "light" | "dark" | "system",
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// === HOOKS ===

/**
 * Fetch user settings (creates default if not exists)
 */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.user(),
    queryFn: async (): Promise<UserSettings> => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Try to get existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, create default
          return createDefaultSettings(supabase, user.id);
        }
        throw new Error(error.message);
      }

      return mapSettingsFromDb(data as DbUserSettings);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsInput): Promise<UserSettings> => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not available");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {};
      if (data.pomodoroWorkMinutes !== undefined) {
        updateData.pomodoro_work_minutes = data.pomodoroWorkMinutes;
      }
      if (data.pomodoroBreakMinutes !== undefined) {
        updateData.pomodoro_break_minutes = data.pomodoroBreakMinutes;
      }
      if (data.pomodoroLongBreakMinutes !== undefined) {
        updateData.pomodoro_long_break_minutes = data.pomodoroLongBreakMinutes;
      }
      if (data.pomodoroSessionsUntilLongBreak !== undefined) {
        updateData.pomodoro_sessions_until_long_break = data.pomodoroSessionsUntilLongBreak;
      }
      if (data.enableNotifications !== undefined) {
        updateData.enable_notifications = data.enableNotifications;
      }
      if (data.enableSounds !== undefined) {
        updateData.enable_sounds = data.enableSounds;
      }
      if (data.theme !== undefined) {
        updateData.theme = data.theme;
      }

      const { data: result, error } = await supabase
        .from("user_settings")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No row exists, create default first then update
          await createDefaultSettings(supabase, user.id);
          // Retry update
          const { data: retryResult, error: retryError } = await supabase
            .from("user_settings")
            .update(updateData)
            .eq("user_id", user.id)
            .select()
            .single();

          if (retryError) throw new Error(retryError.message);
          return mapSettingsFromDb(retryResult as DbUserSettings);
        }
        throw new Error(error.message);
      }

      return mapSettingsFromDb(result as DbUserSettings);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.user(), settings);
    },
  });
}

// === HELPERS ===

async function createDefaultSettings(
  supabase: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userId: string,
): Promise<UserSettings> {
  const settingsData = {
    id: crypto.randomUUID(),
    user_id: userId,
    pomodoro_work_minutes: DEFAULT_SETTINGS.pomodoroWorkMinutes,
    pomodoro_break_minutes: DEFAULT_SETTINGS.pomodoroBreakMinutes,
    pomodoro_long_break_minutes: DEFAULT_SETTINGS.pomodoroLongBreakMinutes,
    pomodoro_sessions_until_long_break: DEFAULT_SETTINGS.pomodoroSessionsUntilLongBreak,
    enable_notifications: DEFAULT_SETTINGS.enableNotifications,
    enable_sounds: DEFAULT_SETTINGS.enableSounds,
    theme: DEFAULT_SETTINGS.theme,
  };

  const { data, error } = await supabase
    .from("user_settings")
    .insert(settingsData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create default settings: ${error.message}`);
  return mapSettingsFromDb(data as DbUserSettings);
}
