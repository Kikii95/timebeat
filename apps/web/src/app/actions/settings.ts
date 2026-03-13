"use server";

import { revalidatePath } from "next/cache";
import { settingsService } from "@/lib/services/settings.service";

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Update timer/pomodoro settings
 */
export async function updateTimerSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const pomodoroWorkMinutes = Number(formData.get("pomodoroWorkMinutes"));
    const pomodoroBreakMinutes = Number(formData.get("pomodoroBreakMinutes"));
    const pomodoroLongBreakMinutes = Number(
      formData.get("pomodoroLongBreakMinutes"),
    );
    const pomodoroSessionsUntilLongBreak = Number(
      formData.get("pomodoroSessionsUntilLongBreak"),
    );

    // Validation
    if (pomodoroWorkMinutes < 1 || pomodoroWorkMinutes > 120) {
      return {
        success: false,
        error: "Work duration must be between 1-120 minutes",
      };
    }
    if (pomodoroBreakMinutes < 1 || pomodoroBreakMinutes > 60) {
      return {
        success: false,
        error: "Break duration must be between 1-60 minutes",
      };
    }

    await settingsService.update({
      pomodoroWorkMinutes,
      pomodoroBreakMinutes,
      pomodoroLongBreakMinutes,
      pomodoroSessionsUntilLongBreak,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update timer settings",
    };
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const enableNotifications = formData.get("enableNotifications") === "true";
    const enableSounds = formData.get("enableSounds") === "true";

    await settingsService.update({
      enableNotifications,
      enableSounds,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update notification settings",
    };
  }
}

/**
 * Update theme setting
 */
export async function updateTheme(
  theme: "light" | "dark" | "system",
): Promise<ActionResult> {
  try {
    await settingsService.update({ theme });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update theme",
    };
  }
}
