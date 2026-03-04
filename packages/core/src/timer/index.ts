/**
 * Timer state machine and logic
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TimerStore,
  TimerState,
  Project,
  Task,
  Session,
  Break
} from '@timebeat/types';
import { STORAGE_KEYS, TIMER_CONSTANTS } from '@timebeat/constants';
import { generateId } from '@timebeat/utils';

const initialState = {
  state: 'IDLE' as TimerState,
  currentSession: null,
  currentProject: null,
  currentTask: null,
  elapsedSeconds: 0,
  pausedSeconds: 0,
  breaks: [],
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      start: (project: Project, task?: Task, plannedMinutes?: number) => {
        const session: Session = {
          id: generateId(),
          userId: '', // Set by auth context
          projectId: project.id,
          taskId: task?.id ?? null,
          type: plannedMinutes ? 'TIMED' : 'FREE',
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
          state: 'RUNNING',
          currentSession: session,
          currentProject: project,
          currentTask: task ?? null,
          elapsedSeconds: 0,
          pausedSeconds: 0,
          breaks: [],
        });
      },

      pause: () => {
        set({ state: 'PAUSED' });
      },

      resume: () => {
        set({ state: 'RUNNING' });
      },

      stop: () => {
        const { currentSession, elapsedSeconds, pausedSeconds } = get();

        if (!currentSession) {
          throw new Error('No active session to stop');
        }

        const completedSession: Session = {
          ...currentSession,
          endedAt: new Date(),
          totalSeconds: elapsedSeconds,
          pausedSeconds,
          updatedAt: new Date(),
        };

        set(initialState);

        return completedSession;
      },

      startBreak: () => {
        const newBreak: Break = {
          id: generateId(),
          sessionId: get().currentSession?.id ?? '',
          startedAt: new Date(),
          endedAt: null,
          durationSeconds: 0,
        };

        set((state) => ({
          state: 'BREAK',
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
              (lastBreak.endedAt.getTime() - lastBreak.startedAt.getTime()) / 1000
            );
          }

          return {
            state: 'RUNNING',
            breaks,
          };
        });
      },

      tick: () => {
        const { state } = get();

        if (state === 'RUNNING') {
          set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
        } else if (state === 'PAUSED' || state === 'BREAK') {
          set((s) => ({ pausedSeconds: s.pausedSeconds + 1 }));
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
        currentSession: state.currentSession,
        currentProject: state.currentProject,
        currentTask: state.currentTask,
        elapsedSeconds: state.elapsedSeconds,
        pausedSeconds: state.pausedSeconds,
        breaks: state.breaks,
      }),
    }
  )
);

// === SELECTORS ===

export const selectIsRunning = (state: TimerStore) => state.state === 'RUNNING';
export const selectIsPaused = (state: TimerStore) => state.state === 'PAUSED';
export const selectIsIdle = (state: TimerStore) => state.state === 'IDLE';
export const selectIsOnBreak = (state: TimerStore) => state.state === 'BREAK';

export const selectRemainingSeconds = (state: TimerStore) => {
  if (!state.currentSession?.plannedMinutes) return null;
  const plannedSeconds = state.currentSession.plannedMinutes * 60;
  return Math.max(0, plannedSeconds - state.elapsedSeconds);
};

export const selectProgress = (state: TimerStore) => {
  if (!state.currentSession?.plannedMinutes) return null;
  const plannedSeconds = state.currentSession.plannedMinutes * 60;
  return Math.min(100, (state.elapsedSeconds / plannedSeconds) * 100);
};

export const selectShouldWarnLongSession = (state: TimerStore) => {
  const warningSeconds = TIMER_CONSTANTS.WARNING_LONG_SESSION_HOURS * 3600;
  return state.elapsedSeconds >= warningSeconds;
};
