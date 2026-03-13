import type { Metadata } from "next";
import type { UserSettings } from "@timebeat/types";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

const isStaticExport = process.env.STATIC_EXPORT === "true";

// Default settings for fallback
const DEFAULT_SETTINGS: UserSettings = {
  id: "",
  userId: "",
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsUntilLongBreak: 4,
  enableNotifications: true,
  enableSounds: true,
  theme: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function getServerData() {
  if (isStaticExport) {
    return { settings: null, user: null };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { settingsService } = await import("@/lib/services/settings.service");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let settings: UserSettings;
    try {
      settings = await settingsService.get();
    } catch {
      settings = DEFAULT_SETTINGS;
    }

    return {
      settings,
      user: user
        ? { email: user.email, created_at: user.created_at }
        : null,
    };
  } catch {
    return { settings: null, user: null };
  }
}

export default async function SettingsPage() {
  const { settings, user } = await getServerData();

  return <SettingsContent initialSettings={settings} initialUser={user} />;
}
