# 🚀 Timebeat — Future Features Specification

> Detailed specifications for post-MVP features (v1.1.0 → v3.0.0)

---

## 📅 Release Timeline

| Version | Codename     | Focus              | ETA     | Features   |
| ------- | ------------ | ------------------ | ------- | ---------- |
| v1.1.0  | Goals        | Objectives & Goals | Q2 2026 | 6 features |
| v1.2.0  | Mobile       | iOS & Android      | Q2 2026 | 8 features |
| v1.3.0  | Sync         | Offline-first      | Q3 2026 | 6 features |
| v2.0.0  | Cloud        | Advanced sync      | Q3 2026 | 5 features |
| v2.1.0  | Pomodoro     | Full workflow      | Q4 2026 | 5 features |
| v2.2.0  | Integrations | GitHub, Calendar   | Q4 2026 | 6 features |
| v3.0.0  | AI           | Smart features     | 2027    | 4 features |

---

## 🎯 v1.1.0 — Goals System

### TB-100: Time Goals

**Description**: Users can set time-based goals for projects.

**UI Mockup**:

```
┌────────────────────────────────────────────┐
│  🎯 Create Goal                            │
├────────────────────────────────────────────┤
│  Project: [Dropdown - Timebeat]            │
│                                            │
│  Goal Type: ○ Daily  ● Weekly  ○ Monthly   │
│                                            │
│  Target:    [10] hours                     │
│                                            │
│  Start:     [2026-03-18] (Monday)          │
│                                            │
│  [ ] Repeat every week                     │
│                                            │
│         [Cancel]  [Create Goal]            │
└────────────────────────────────────────────┘
```

**Data Model**:

```typescript
interface Goal {
  id: string;
  userId: string;
  projectId: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY";
  targetMinutes: number;
  startDate: Date;
  endDate: Date;
  repeat: boolean;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "ARCHIVED";
  createdAt: Date;
}

interface GoalProgress {
  goalId: string;
  periodStart: Date;
  periodEnd: Date;
  currentMinutes: number;
  percentage: number;
  status: "ON_TRACK" | "BEHIND" | "COMPLETED";
}
```

**Implementation**:

1. Add `Goal` and `GoalProgress` tables to Prisma schema
2. Create `GoalService` with CRUD operations
3. Create `useGoals` hook
4. Build UI components: `GoalCard`, `GoalForm`, `GoalProgress`
5. Add goals section to Dashboard
6. Implement progress calculation cron job

---

### TB-101: Goal Dashboard Widget

**Description**: Dashboard widget showing goal progress.

**UI**:

```
┌─────────────────────────────────────────────┐
│  📊 Weekly Goals                            │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ Timebeat                    8h / 10h  │  │
│  │ [████████████████████░░░░░]      80%  │  │
│  │ 2h remaining • On track 🟢           │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ Side Project                2h / 5h   │  │
│  │ [████████░░░░░░░░░░░░░░░░░]      40%  │  │
│  │ 3h remaining • Behind 🟠             │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

### TB-102: Goal Notifications

**Types**:

- `GOAL_50_PERCENT` — "You're halfway to your goal!"
- `GOAL_90_PERCENT` — "Almost there! 10% left"
- `GOAL_COMPLETED` — "🎉 Goal achieved!"
- `GOAL_BEHIND` — "You're behind on [project] this week"

---

## 📱 v1.2.0 — Mobile Apps

### TB-120: Capacitor Setup

**Structure**:

```
apps/mobile/
├── android/
│   └── app/src/main/
├── ios/
│   └── App/
├── src/
│   ├── App.tsx          # Entry point
│   ├── pages/           # Mobile routes
│   ├── components/      # Mobile-specific UI
│   └── lib/
│       ├── capacitor/   # Native plugins
│       └── hooks/       # Mobile hooks
├── capacitor.config.ts
├── package.json
└── vite.config.ts
```

**Capacitor Plugins**:

```json
{
  "dependencies": {
    "@capacitor/app": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/preferences": "^6.0.0"
  }
}
```

---

### TB-123: Background Timer (Android)

**Implementation**: Foreground Service

```kotlin
// android/app/src/main/java/TimerService.kt
class TimerService : Service() {
    private val NOTIFICATION_ID = 1
    private var timerRunning = false
    private var elapsedSeconds = 0

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())
        startTimer()
        return START_STICKY
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Timebeat Timer")
            .setContentText(formatTime(elapsedSeconds))
            .setSmallIcon(R.drawable.ic_timer)
            .setOngoing(true)
            .build()
    }
}
```

**Capacitor Plugin Bridge**:

```typescript
// src/lib/capacitor/timer-service.ts
import { registerPlugin } from "@capacitor/core";

interface TimerServicePlugin {
  startService(options: { projectName: string }): Promise<void>;
  stopService(): Promise<void>;
  getElapsed(): Promise<{ seconds: number }>;
}

const TimerService = registerPlugin<TimerServicePlugin>("TimerService");
export default TimerService;
```

---

### TB-125: iOS Background Task

```swift
// ios/App/BackgroundTimer.swift
import BackgroundTasks
import UIKit

class BackgroundTimer {
    static let shared = BackgroundTimer()

    func scheduleBackgroundRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.timebeat.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 60)
        try? BGTaskScheduler.shared.submit(request)
    }

    func handleBackgroundRefresh(task: BGAppRefreshTask) {
        // Update timer, sync with server
        scheduleBackgroundRefresh()
        task.setTaskCompleted(success: true)
    }
}
```

---

### TB-124: Home Screen Widget

**Android Widget**:

```xml
<!-- android/app/src/main/res/layout/timer_widget.xml -->
<LinearLayout>
    <TextView android:id="@+id/timer_text" />
    <TextView android:id="@+id/project_name" />
    <Button android:id="@+id/start_stop" />
</LinearLayout>
```

**iOS Widget** (WidgetKit):

```swift
struct TimerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "TimerWidget",
            provider: TimerProvider()
        ) { entry in
            TimerWidgetView(entry: entry)
        }
    }
}
```

---

## 🔄 v1.3.0 — Offline Sync

### TB-130: SQLite Local Database

**Schema** (same as Supabase, local):

```sql
-- Local SQLite
CREATE TABLE sessions_local (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  duration_seconds INTEGER,
  sync_status TEXT DEFAULT 'pending',
  remote_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT
);
```

**Sync Flow**:

```
┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│ Local SQLite │ ──▶ │  Sync Queue   │ ──▶ │  Supabase   │
└──────────────┘     └───────────────┘     └─────────────┘
       ▲                    │                     │
       │                    ▼                     │
       │            ┌───────────────┐             │
       └──────────── │ Conflict Res │ ◀───────────┘
                     └───────────────┘
```

---

### TB-133: Conflict Resolution

**Strategy**: Last-Write-Wins with merge hints

```typescript
interface SyncConflict {
  localRecord: Session;
  remoteRecord: Session;
  conflictType: "UPDATE" | "DELETE";
}

function resolveConflict(conflict: SyncConflict): Session {
  const { localRecord, remoteRecord } = conflict;

  // Last write wins
  if (localRecord.updatedAt > remoteRecord.updatedAt) {
    return localRecord;
  }
  return remoteRecord;
}

// For complex merges (future)
function mergeSession(local: Session, remote: Session): Session {
  return {
    ...remote,
    // Local takes precedence for user-editable fields
    description: local.description || remote.description,
    taskId: local.taskId || remote.taskId,
    // Server takes precedence for computed fields
    durationSeconds: remote.durationSeconds,
  };
}
```

---

## 🔗 v2.2.0 — Integrations

### TB-300: GitHub Integration

**Features**:

- Auto-detect coding sessions from commits
- Link commits to timer sessions
- Show GitHub activity in dashboard

**OAuth Flow**:

```
User → [Connect GitHub] → GitHub OAuth
                              ↓
                        Access Token
                              ↓
                        Store in DB
                              ↓
                    Webhook: Push events
                              ↓
                    Create/link sessions
```

**Data Model**:

```typescript
interface GitHubIntegration {
  userId: string;
  accessToken: string; // encrypted
  refreshToken: string; // encrypted
  githubUserId: string;
  repositories: string[]; // tracked repos
  autoTrack: boolean;
}

interface CommitSession {
  sessionId: string;
  commitSha: string;
  repository: string;
  message: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}
```

---

### TB-303: VS Code Extension

**Features**:

- Start/stop timer from VS Code
- Auto-detect project from workspace
- Show timer in status bar

**Extension Structure**:

```
extensions/vscode/
├── src/
│   ├── extension.ts    # Entry point
│   ├── timer.ts        # Timer commands
│   ├── statusBar.ts    # Status bar item
│   └── api.ts          # Timebeat API client
├── package.json
└── tsconfig.json
```

**Commands**:

- `timebeat.start` — Start timer
- `timebeat.pause` — Pause timer
- `timebeat.stop` — Stop timer
- `timebeat.selectProject` — Pick project

---

## 🤖 v3.0.0 — AI Features

### TB-330: Time Estimation

**Description**: AI suggests time estimates based on task description and historical data.

**Implementation**:

```typescript
interface TimeEstimate {
  taskDescription: string;
  suggestedMinutes: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  basedOn: {
    similarTasks: number;
    averageTime: number;
    projectAverage: number;
  };
}

async function estimateTaskTime(
  description: string,
  projectId: string
): Promise<TimeEstimate> {
  // 1. Get similar tasks from history
  const similarTasks = await findSimilarTasks(description, projectId);

  // 2. Calculate weighted average
  const avgTime = calculateWeightedAverage(similarTasks);

  // 3. Apply project-specific adjustments
  const projectMultiplier = await getProjectComplexityFactor(projectId);

  return {
    taskDescription: description,
    suggestedMinutes: Math.round(avgTime * projectMultiplier),
    confidence: similarTasks.length > 5 ? 'HIGH' : 'MEDIUM',
    basedOn: { ... }
  };
}
```

---

### TB-331: Productivity Insights

**Weekly Report**:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Weekly Productivity Report                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏱️  Total Time: 42h 30m (+15% vs last week)               │
│                                                             │
│  🏆 Most Productive Day: Wednesday (9h 15m)                │
│  😴 Least Productive Day: Friday (4h 30m)                  │
│                                                             │
│  💡 Insights:                                               │
│  • You work best between 9 AM - 12 PM                      │
│  • Consider taking breaks every 90 minutes                 │
│  • Your focus time increased by 20% this week              │
│                                                             │
│  🎯 Suggestions:                                            │
│  • Schedule deep work during your peak hours               │
│  • You have 3 unfinished tasks from last week              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### TB-333: Natural Language Task Creation

**Examples**:

```
User: "Work on Timebeat mobile app for 2 hours tomorrow morning"

Parsed:
{
  project: "Timebeat",
  task: "mobile app",
  duration: 120, // minutes
  scheduledFor: "2026-03-13T09:00:00",
  mode: "TIMED"
}

User: "Track time on bug fixes until done"

Parsed:
{
  project: null, // ask user
  task: "bug fixes",
  duration: null,
  mode: "FREE"
}
```

**Implementation**: Local LLM or OpenAI function calling

---

## 📊 Feature Metrics

### Success Criteria

| Feature      | Metric                    | Target |
| ------------ | ------------------------- | ------ |
| Goals        | % users with active goals | > 60%  |
| Mobile       | DAU mobile vs web ratio   | > 40%  |
| Sync         | Sync success rate         | > 99%  |
| GitHub       | Connected users           | > 30%  |
| AI Estimates | Accuracy within 20%       | > 70%  |

---

## 🔮 Beyond v3.0.0

### Ideas Parking Lot

- **Team workspaces** — Collaborative time tracking
- **Invoicing** — Generate invoices from tracked time
- **Browser extension** — Track time on any website
- **API** — Public API for integrations
- **Zapier/Make** — No-code automation
- **Apple Watch / WearOS** — Wearable apps
- **Voice control** — "Hey Timebeat, start timer"
- **Gamification** — Streaks, achievements, levels

---

_Last updated: 2026-03-12_
