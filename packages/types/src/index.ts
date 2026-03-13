/**
 * @package @timebeat/types
 * Shared TypeScript types for Timebeat
 */

// === ENUMS ===

export enum ProjectType {
  PERSONAL = "PERSONAL",
  WORK = "WORK",
  FREELANCE = "FREELANCE",
  LEARNING = "LEARNING",
  OPEN_SOURCE = "OPEN_SOURCE",
}

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum SessionType {
  FREE = "FREE",
  TIMED = "TIMED",
  POMODORO = "POMODORO",
}

export enum GoalPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  CUSTOM = "CUSTOM",
}

export enum TimerState {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  BREAK = "BREAK",
}

// === INTERFACES ===

export interface User {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsUntilLongBreak: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  theme: "light" | "dark" | "system";
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  color: string;
  icon: string | null;
  stack: string[];
  platform: string[];
  totalTimeSeconds: number;
  sessionCount: number;
  lastSessionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  estimatedMinutes: number | null;
  actualMinutes: number;
  priority: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface Session {
  id: string;
  userId: string;
  projectId: string;
  taskId: string | null;
  type: SessionType;
  plannedMinutes: number | null;
  startedAt: Date;
  endedAt: Date | null;
  totalSeconds: number;
  pausedSeconds: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Break {
  id: string;
  sessionId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
}

export interface Goal {
  id: string;
  userId: string;
  projectId: string | null;
  period: GoalPeriod;
  targetMinutes: number;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncOutbox {
  id: string;
  userId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  tableName: string;
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  syncedAt: Date | null;
  retryCount: number;
}

// === TIMER STATE ===

export type TimerMode = "FREE" | "TIMED";

export interface TimerStore {
  // State
  state: TimerState;
  mode: TimerMode;
  elapsed: number;
  planned: number | null;
  pausedTime: number;
  currentSession: Session | null;
  currentProject: Project | null;
  currentTask: Task | null;
  breaks: Break[];

  // Actions
  start: (project?: Project, task?: Task, plannedMinutes?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Session | null;
  startBreak: () => void;
  endBreak: () => void;
  tick: () => void;
  reset: () => void;
}

// === API TYPES ===

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
