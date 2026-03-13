/**
 * @package @timebeat/constants
 * Shared constants for Timebeat
 */

// === TIMER ===

export const TIMER_CONSTANTS = {
  DEFAULT_POMODORO_WORK_MINUTES: 25,
  DEFAULT_POMODORO_BREAK_MINUTES: 5,
  DEFAULT_POMODORO_LONG_BREAK_MINUTES: 15,
  DEFAULT_SESSIONS_UNTIL_LONG_BREAK: 4,
  TICK_INTERVAL_MS: 1000,
  MAX_SESSION_HOURS: 12,
  WARNING_LONG_SESSION_HOURS: 5,
} as const;

// === SYNC ===

export const SYNC_CONSTANTS = {
  MAX_RETRY_COUNT: 5,
  RETRY_DELAY_MS: 5000,
  BATCH_SIZE: 50,
  SYNC_INTERVAL_MS: 30000,
} as const;

// === UI ===

export const UI_CONSTANTS = {
  TOAST_DURATION_MS: 3000,
  DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// === COLORS ===

export const PROJECT_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Purple
  "#85C1E9", // Light Blue
] as const;

export const DEFAULT_PROJECT_COLOR = "#4ECDC4"; // Teal

// === ICONS ===

export const PROJECT_ICONS = [
  "code",
  "book",
  "briefcase",
  "gamepad",
  "music",
  "video",
  "palette",
  "rocket",
  "heart",
  "star",
  "folder",
  "terminal",
] as const;

// === NOTIFICATIONS ===

export const NOTIFICATION_CONSTANTS = {
  BREAK_REMINDER_TITLE: "Time for a break!",
  SESSION_END_TITLE: "Session completed",
  HYDRATION_REMINDER_TITLE: "Stay hydrated!",
  STRETCH_REMINDER_TITLE: "Time to stretch",
} as const;

// === LOCAL STORAGE KEYS ===

export const STORAGE_KEYS = {
  TIMER_STATE: "timebeat:timer",
  USER_SETTINGS: "timebeat:settings",
  OFFLINE_QUEUE: "timebeat:offline-queue",
  LAST_SYNC: "timebeat:last-sync",
  AUTH_TOKEN: "timebeat:auth",
} as const;

// === ROUTES ===

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  TASKS: "/tasks",
  STATS: "/stats",
  SETTINGS: "/settings",
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
} as const;

// === PLATFORMS ===

export const PLATFORMS = [
  "Web",
  "Mobile",
  "Desktop",
  "CLI",
  "API",
  "Cross-platform",
] as const;

// === STACKS ===

export const TECH_STACKS = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Node.js",
  "Python",
  "Rust",
  "Go",
  "TypeScript",
  "Flutter",
  "React Native",
  "Tauri",
  "Electron",
] as const;

// === CATEGORIES ===

export const PROJECT_CATEGORIES = [
  "Personal",
  "Work",
  "Freelance",
  "Learning",
  "Open Source",
] as const;
