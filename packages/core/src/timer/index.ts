/**
 * Timer state machine and logic
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  TimerStore,
  TimerMode,
  Project,
  Task,
  Session,
  Break,
} from "@timebeat/types";
import { TimerState, SessionType } from "@timebeat/types";
import { STORAGE_KEYS, TIMER_CONSTANTS } from "@timebeat/constants";
import { generateId } from "@timebeat/utils";

const initialState: Pick<
  TimerStore,
  | "state"
  | "mode"
  | "elapsed"
  | "planned"
  | "pausedTime"
  | "currentSession"
  | "currentProject"
  | "currentTask"
  | "breaks"
> = {
  state: TimerState.IDLE,
  mode: "FREE" as TimerMode,
  elapsed: 0,
  planned: null,
  pausedTime: 0,
  currentSession: null,
  currentProject: null,
  currentTask: null,
  breaks: [],
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      start: (project?: Project, task?: Task, plannedMinutes?: number) => {
        const mode: TimerMode = plannedMinutes ? "TIMED" : "FREE";

        const session: Session = {
          id: generateId(),
          userId: "", // Set by auth context when saving
          projectId: project?.id ?? "",
          taskId: task?.id ?? null,
          type: plannedMinutes ? SessionType.TIMED : SessionType.FREE,
          plannedMinutes: plannedMinutes ?? null,
          startedAt: new Date(),
          endedAt: null,
          totalSeconds: 0,
          pausedSeconds: 0,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          state: TimerState.RUNNING,
          mode,
          elapsed: 0,
          planned: plannedMinutes ? plannedMinutes * 60 : null,
          pausedTime: 0,
          currentSession: session,
          currentProject: project ?? null,
          currentTask: task ?? null,
          breaks: [],
        });
      },

      pause: () => {
        set({ state: TimerState.PAUSED });
      },

      resume: () => {
        set({ state: TimerState.RUNNING });
      },

      stop: () => {
        const { currentSession, elapsed, pausedTime } = get();

        if (!currentSession) {
          set(initialState);
          return null;
        }

        const completedSession: Session = {
          ...currentSession,
          endedAt: new Date(),
          totalSeconds: elapsed,
          pausedSeconds: pausedTime,
          updatedAt: new Date(),
        };

        set(initialState);

        return completedSession;
      },

      startBreak: () => {
        const newBreak: Break = {
          id: generateId(),
          sessionId: get().currentSession?.id ?? "",
          startedAt: new Date(),
          endedAt: null,
          durationSeconds: 0,
        };

        set((state) => ({
          state: TimerState.BREAK,
          breaks: [...state.breaks, newBreak],
        }));
      },

      endBreak: () => {
        set((state) => {
          const breaks = [...state.breaks];
          const lastBreak = breaks[breaks.length - 1];

          if (lastBreak && !lastBreak.endedAt) {
            lastBreak.endedAt = new Date();
            lastBreak.durationSeconds = Math.floor(
              (lastBreak.endedAt.getTime() - lastBreak.startedAt.getTime()) /
                1000,
            );
          }

          return {
            state: TimerState.RUNNING,
            breaks,
          };
        });
      },

      tick: () => {
        const { state } = get();

        if (state === TimerState.RUNNING) {
          set((s) => ({ elapsed: s.elapsed + 1 }));
        } else if (state === TimerState.PAUSED || state === TimerState.BREAK) {
          set((s) => ({ pausedTime: s.pausedTime + 1 }));
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: STORAGE_KEYS.TIMER_STATE,
      partialize: (state) => ({
        state: state.state,
        mode: state.mode,
        elapsed: state.elapsed,
        planned: state.planned,
        pausedTime: state.pausedTime,
        currentSession: state.currentSession,
        currentProject: state.currentProject,
        currentTask: state.currentTask,
        breaks: state.breaks,
      }),
    },
  ),
);

// === SELECTORS ===

export const selectIsRunning = (state: TimerStore) => state.state === "RUNNING";
export const selectIsPaused = (state: TimerStore) => state.state === "PAUSED";
export const selectIsIdle = (state: TimerStore) => state.state === "IDLE";
export const selectIsOnBreak = (state: TimerStore) => state.state === "BREAK";

export const selectRemainingSeconds = (state: TimerStore) => {
  if (!state.planned) return null;
  return Math.max(0, state.planned - state.elapsed);
};

export const selectProgress = (state: TimerStore) => {
  if (!state.planned) return null;
  return Math.min(100, (state.elapsed / state.planned) * 100);
};

export const selectShouldWarnLongSession = (state: TimerStore) => {
  const warningSeconds = TIMER_CONSTANTS.WARNING_LONG_SESSION_HOURS * 3600;
  return state.elapsed >= warningSeconds;
};
