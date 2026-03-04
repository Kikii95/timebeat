# Timer Specification

**Version**: 1.0
**Date**: 2026-03-04
**Status**: Draft

## Overview

The timer is the core feature of Timebeat. It tracks time spent on projects and tasks with support for different modes and cross-platform persistence.

## State Machine

```
                    ┌─────────────────┐
                    │                 │
                    │      IDLE       │
                    │                 │
                    └────────┬────────┘
                             │
                         start()
                             │
                             ▼
    ┌────────────────────────────────────────────┐
    │                                            │
    │               RUNNING                       │
    │                                            │
    │   [tick every 1s → elapsedSeconds++]       │
    │                                            │
    └──────┬─────────────────┬──────────────────┬┘
           │                 │                  │
       pause()          startBreak()         stop()
           │                 │                  │
           ▼                 ▼                  │
    ┌──────────────┐  ┌──────────────┐         │
    │              │  │              │         │
    │    PAUSED    │  │    BREAK     │         │
    │              │  │              │         │
    └──────┬───────┘  └──────┬───────┘         │
           │                 │                  │
       resume()          endBreak()            │
           │                 │                  │
           └────────┬────────┘                  │
                    │                           │
                    ▼                           │
    ┌───────────────────────────┐              │
    │         RUNNING           │◀─────────────┤
    └───────────────────────────┘              │
                                               │
                                               ▼
                                    ┌──────────────┐
                                    │              │
                                    │     IDLE     │
                                    │              │
                                    └──────────────┘
                                    [Session saved]
```

## Timer Modes

### 1. Free Mode

No time limit. Timer runs until manually stopped.

```typescript
// Start free mode
timer.start(project, task); // no plannedMinutes
```

**UI**:
- Shows elapsed time counting up
- No progress bar
- Stop button always visible

### 2. Timed Mode

Set duration before starting. Alert when time is up.

```typescript
// Start timed mode (3 hours)
timer.start(project, task, 180); // 180 minutes
```

**UI**:
- Shows remaining time counting down
- Progress bar fills up
- Alert at 100%
- Can continue past limit (overtime)

### 3. Pomodoro Mode (Future)

Structured work/break intervals.

```typescript
// Pomodoro config from settings
{
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4
}
```

## Store Interface

```typescript
interface TimerStore {
  // State
  state: TimerState; // IDLE | RUNNING | PAUSED | BREAK
  currentSession: Session | null;
  currentProject: Project | null;
  currentTask: Task | null;
  elapsedSeconds: number;
  pausedSeconds: number;
  breaks: Break[];

  // Actions
  start(project: Project, task?: Task, plannedMinutes?: number): void;
  pause(): void;
  resume(): void;
  stop(): Session; // Returns completed session
  startBreak(): void;
  endBreak(): void;
  tick(): void; // Called every second
  reset(): void;
}
```

## Persistence

### Zustand Persist

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'timebeat:timer',
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
```

### Recovery on Restart

```typescript
function recoverTimerState() {
  const persisted = localStorage.getItem('timebeat:timer');
  if (!persisted) return;

  const state = JSON.parse(persisted);

  if (state.state === 'RUNNING' && state.currentSession) {
    const lastTickTime = new Date(state.currentSession.updatedAt);
    const now = new Date();
    const missedSeconds = Math.floor((now - lastTickTime) / 1000);

    // Add missed time
    state.elapsedSeconds += missedSeconds;

    // Resume timer
    setInterval(tick, 1000);
  }
}
```

## Platform Implementations

### Web

- `setInterval` for ticking
- Page Visibility API to detect background
- localStorage for persistence
- Notification API for alerts

```typescript
// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab hidden - save timestamp
    saveLastTickTime();
  } else {
    // Tab visible - recover missed time
    recoverMissedTime();
  }
});
```

### Desktop (Tauri)

- Rust-side timer for precision
- System tray icon with timer display
- tauri-plugin-notification for alerts
- SQLite for persistence

```rust
// Tray update every second
fn update_tray_timer(elapsed: u64) {
    let formatted = format_duration(elapsed);
    tray.set_tooltip(&formatted);
}
```

### Mobile (Capacitor)

**Android**:
- Foreground Service for background timer
- Notification with progress
- SQLite via capacitor-sqlite

**iOS**:
- Background Task API (limited)
- Local notifications for alerts
- Core Data / SQLite

## UI Components

### TimerDisplay

Shows current timer state.

```tsx
<TimerDisplay
  elapsed={elapsedSeconds}
  planned={plannedMinutes}
  state={timerState}
  project={currentProject}
  task={currentTask}
/>
```

**Variants**:
- `compact` — For tray/widget
- `full` — For main dashboard
- `mini` — For header bar

### TimerControls

Start/pause/stop buttons.

```tsx
<TimerControls
  state={timerState}
  onStart={() => {}}
  onPause={() => {}}
  onResume={() => {}}
  onStop={() => {}}
  onBreak={() => {}}
/>
```

### ProjectSelector

Quick project selection for timer start.

```tsx
<ProjectSelector
  projects={projects}
  recent={recentProjects}
  onSelect={(project) => timer.start(project)}
/>
```

## Events & Hooks

### useTimerTick

```typescript
function useTimerTick() {
  const tick = useTimerStore((s) => s.tick);
  const state = useTimerStore((s) => s.state);

  useEffect(() => {
    if (state === 'RUNNING' || state === 'PAUSED' || state === 'BREAK') {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [state, tick]);
}
```

### Timer Events

```typescript
// Emitted when timer state changes
type TimerEvent =
  | { type: 'STARTED'; session: Session }
  | { type: 'PAUSED' }
  | { type: 'RESUMED' }
  | { type: 'STOPPED'; session: Session }
  | { type: 'BREAK_STARTED' }
  | { type: 'BREAK_ENDED' }
  | { type: 'MILESTONE'; minutes: number }; // Every 25 minutes
```

## Edge Cases

### 1. App Crash During Running Timer

- On restart, detect `state === 'RUNNING'`
- Calculate time since last `updatedAt`
- Add to `elapsedSeconds`
- Show recovery notification
- Resume timer

### 2. Device Sleep

- Save timestamp before sleep
- On wake, calculate missed time
- Ask user: "You were away for 2h. Include in session?"

### 3. Clock Changes (DST, manual)

- Use monotonic time for elapsed calculation
- `performance.now()` for precision
- Fallback to Date for persistence

### 4. Multiple Tabs/Windows

- Lock timer to single tab
- Use BroadcastChannel for sync
- Show "Timer active in another tab"

## Testing

### Unit Tests

```typescript
describe('TimerStore', () => {
  it('should start timer with project', () => {});
  it('should track elapsed time', () => {});
  it('should pause and resume', () => {});
  it('should save session on stop', () => {});
  it('should handle breaks', () => {});
  it('should persist state', () => {});
  it('should recover from crash', () => {});
});
```

### Integration Tests

- Timer + persistence
- Timer + notifications
- Timer + project stats update

---

*This specification defines the timer behavior for Timebeat.*
