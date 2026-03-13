"use client";

import type { UserSettings } from "@timebeat/types";
import { useSettings, useCurrentUser } from "@timebeat/hooks";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@timebeat/ui";
import {
  TimerSettingsForm,
  NotificationSettingsForm,
  ThemeSelector,
} from "./SettingsForm";
import { SignOutButton } from "./SignOutButton";

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

interface SettingsContentProps {
  initialSettings?: UserSettings | null;
  initialUser?: {
    email?: string;
    created_at?: string;
  } | null;
}

export function SettingsContent({
  initialSettings,
  initialUser,
}: SettingsContentProps) {
  // Use client-side data fetching
  const { data: fetchedSettings, isLoading: settingsLoading } = useSettings();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Use fetched data or initial data from server
  const settings = fetchedSettings ?? initialSettings ?? DEFAULT_SETTINGS;
  const userData = user ?? initialUser;

  const isLoading = (settingsLoading || userLoading) && !initialSettings;

  if (isLoading) {
    return <SettingsSkeleton />;
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
              <p className="font-medium">{userData?.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Member since
              </p>
              <p className="font-medium">
                {userData?.created_at
                  ? new Date(userData.created_at).toLocaleDateString()
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
          <CardTitle className="text-[var(--color-danger-600)]">
            Danger Zone
          </CardTitle>
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

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
