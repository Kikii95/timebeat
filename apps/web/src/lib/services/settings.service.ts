/**
 * Settings Service Layer
 * Handles user settings database operations
 */

import { createClient } from "../supabase/server";
import type { UserSettings } from "@timebeat/types";

// === DEFAULT VALUES ===

const DEFAULT_SETTINGS: Omit<
  UserSettings,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsUntilLongBreak: 4,
  enableNotifications: true,
  enableSounds: true,
  theme: "system",
};

// === INPUT TYPES ===

export interface UpdateSettingsInput {
  pomodoroWorkMinutes?: number;
  pomodoroBreakMinutes?: number;
  pomodoroLongBreakMinutes?: number;
  pomodoroSessionsUntilLongBreak?: number;
  enableNotifications?: boolean;
  enableSounds?: boolean;
  theme?: "light" | "dark" | "system";
}

// === SERVICE ===

export const settingsService = {
  /**
   * Get user settings (creates default if not exists)
   */
  async get(): Promise<UserSettings> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Try to get existing settings
    const { data: settings, error } = await supabase
      .from("user_settings")
      .select()
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, create default
        return this.createDefault();
      }
      throw new Error(`Failed to get settings: ${error.message}`);
    }

    return mapSettingsFromDb(settings);
  },

  /**
   * Create default settings for user
   */
  async createDefault(): Promise<UserSettings> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const settingsData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      pomodoro_work_minutes: DEFAULT_SETTINGS.pomodoroWorkMinutes,
      pomodoro_break_minutes: DEFAULT_SETTINGS.pomodoroBreakMinutes,
      pomodoro_long_break_minutes: DEFAULT_SETTINGS.pomodoroLongBreakMinutes,
      pomodoro_sessions_until_long_break:
        DEFAULT_SETTINGS.pomodoroSessionsUntilLongBreak,
      enable_notifications: DEFAULT_SETTINGS.enableNotifications,
      enable_sounds: DEFAULT_SETTINGS.enableSounds,
      theme: DEFAULT_SETTINGS.theme,
    };

    const { data: settings, error } = await supabase
      .from("user_settings")
      .insert(settingsData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create settings: ${error.message}`);
    }

    return mapSettingsFromDb(settings);
  },

  /**
   * Update user settings
   */
  async update(data: UpdateSettingsInput): Promise<UserSettings> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

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
      updateData.pomodoro_sessions_until_long_break =
        data.pomodoroSessionsUntilLongBreak;
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

    const { data: settings, error } = await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // If no row exists, create default first then update
      if (error.code === "PGRST116") {
        await this.createDefault();
        return this.update(data);
      }
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return mapSettingsFromDb(settings);
  },
};

// === HELPERS ===

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
