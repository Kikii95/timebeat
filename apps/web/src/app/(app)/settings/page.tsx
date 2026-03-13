import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { settingsService } from "@/lib/services/settings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@timebeat/ui";
import { TimerSettingsForm, NotificationSettingsForm, ThemeSelector } from "./SettingsForm";
import { SignOutButton } from "./SignOutButton";
import type { UserSettings } from "@timebeat/types";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

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

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch settings (will create default if not exists)
  let settings: UserSettings;
  try {
    settings = await settingsService.get();
  } catch {
    settings = DEFAULT_SETTINGS;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-[var(--color-text-muted)]">
          Manage your account and preferences
        </p>
      </div>

      {/* Account section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Email</p>
              <p className="font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Member since</p>
              <p className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme section */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector settings={settings} />
        </CardContent>
      </Card>

      {/* Timer preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Timer Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <TimerSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--color-danger-200)]">
        <CardHeader className="border-b border-[var(--color-danger-200)]">
          <CardTitle className="text-[var(--color-danger-600)]">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Sign out of your account on this device
              </p>
            </div>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
