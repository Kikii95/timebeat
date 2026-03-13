"use client";

import { useState } from "react";
import { Button, Input, Label } from "@timebeat/ui";
import type { UserSettings } from "@timebeat/types";
import {
  updateTimerSettings,
  updateNotificationSettings,
  updateTheme,
} from "@/app/actions/settings";

interface SettingsFormProps {
  settings: UserSettings;
}

export function TimerSettingsForm({ settings }: SettingsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);

    const result = await updateTimerSettings(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Timer settings saved!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save" });
    }

    setIsPending(false);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pomodoroWorkMinutes">Work Duration (min)</Label>
          <Input
            id="pomodoroWorkMinutes"
            name="pomodoroWorkMinutes"
            type="number"
            min={1}
            max={120}
            defaultValue={settings.pomodoroWorkMinutes}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pomodoroBreakMinutes">Break Duration (min)</Label>
          <Input
            id="pomodoroBreakMinutes"
            name="pomodoroBreakMinutes"
            type="number"
            min={1}
            max={60}
            defaultValue={settings.pomodoroBreakMinutes}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pomodoroLongBreakMinutes">Long Break (min)</Label>
          <Input
            id="pomodoroLongBreakMinutes"
            name="pomodoroLongBreakMinutes"
            type="number"
            min={1}
            max={60}
            defaultValue={settings.pomodoroLongBreakMinutes}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pomodoroSessionsUntilLongBreak">
            Sessions until Long Break
          </Label>
          <Input
            id="pomodoroSessionsUntilLongBreak"
            name="pomodoroSessionsUntilLongBreak"
            type="number"
            min={1}
            max={10}
            defaultValue={settings.pomodoroSessionsUntilLongBreak}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Timer Settings"}
        </Button>
        {message && (
          <span
            className={`text-sm ${
              message.type === "success"
                ? "text-[var(--color-success-600)]"
                : "text-[var(--color-danger-600)]"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

export function NotificationSettingsForm({ settings }: SettingsFormProps) {
  const [enableNotifications, setEnableNotifications] = useState(
    settings.enableNotifications,
  );
  const [enableSounds, setEnableSounds] = useState(settings.enableSounds);
  const [isPending, setIsPending] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission | null>(null);

  // Check notification permission on mount
  useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  });

  async function requestPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  }

  async function handleToggle(key: "notifications" | "sounds", value: boolean) {
    setIsPending(true);

    const formData = new FormData();
    if (key === "notifications") {
      formData.set("enableNotifications", String(value));
      formData.set("enableSounds", String(enableSounds));
      setEnableNotifications(value);
    } else {
      formData.set("enableNotifications", String(enableNotifications));
      formData.set("enableSounds", String(value));
      setEnableSounds(value);
    }

    await updateNotificationSettings(formData);
    setIsPending(false);
  }

  return (
    <div className="space-y-4">
      {permissionStatus === "denied" && (
        <div className="rounded-lg bg-[var(--color-warning-100)] p-3 text-sm text-[var(--color-warning-800)]">
          Notifications are blocked. Please enable them in your browser
          settings.
        </div>
      )}

      {permissionStatus === "default" && (
        <div className="flex items-center justify-between rounded-lg bg-[var(--color-primary-50)] p-3">
          <span className="text-sm">Enable browser notifications?</span>
          <Button size="sm" onClick={requestPermission}>
            Enable
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Timer Notifications</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Get notified when timer completes or breaks start
          </p>
        </div>
        <ToggleSwitch
          checked={enableNotifications}
          onChange={(v) => handleToggle("notifications", v)}
          disabled={isPending || permissionStatus === "denied"}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Sound Effects</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Play sounds for timer events
          </p>
        </div>
        <ToggleSwitch
          checked={enableSounds}
          onChange={(v) => handleToggle("sounds", v)}
          disabled={isPending}
        />
      </div>
    </div>
  );
}

export function ThemeSelector({ settings }: SettingsFormProps) {
  const [theme, setTheme] = useState(settings.theme);
  const [isPending, setIsPending] = useState(false);

  async function handleThemeChange(newTheme: "light" | "dark" | "system") {
    setIsPending(true);
    setTheme(newTheme);
    await updateTheme(newTheme);
    setIsPending(false);

    // Apply theme to document
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (newTheme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", newTheme === "dark");
      }
    }
  }

  const themes = [
    { value: "light" as const, label: "Light", icon: "☀️" },
    { value: "dark" as const, label: "Dark", icon: "🌙" },
    { value: "system" as const, label: "System", icon: "💻" },
  ];

  return (
    <div className="flex gap-3">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => handleThemeChange(t.value)}
          disabled={isPending}
          className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
            theme === t.value
              ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
              : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="text-sm font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// === TOGGLE SWITCH ===

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked
          ? "bg-[var(--color-primary-500)]"
          : "bg-[var(--color-neutral-300)]"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
