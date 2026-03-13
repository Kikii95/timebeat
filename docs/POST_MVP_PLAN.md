# 📋 Timebeat — Post-MVP Implementation Plan

> Detailed execution plan for v1.1.0 → v2.0.0

---

## 🎯 Strategic Overview

### Priorities

1. **v1.1.0 Goals** — Core feature users requested
2. **v1.2.0 Mobile** — Expand reach, mobile-first users
3. **v1.3.0 Offline** — Essential for reliability
4. **v2.0.0 Cloud** — Full sync, premium features

### Time Estimates

| Version | Duration | Start | End |
|---------|----------|-------|-----|
| v1.1.0 | 2 weeks | 2026-03-18 | 2026-04-01 |
| v1.2.0 | 4 weeks | 2026-04-01 | 2026-04-29 |
| v1.3.0 | 2 weeks | 2026-04-29 | 2026-05-13 |
| v2.0.0 | 3 weeks | 2026-05-13 | 2026-06-03 |

---

## 📦 v1.1.0 — Goals System (2 weeks)

### Week 1: Backend + Core

#### Day 1-2: Database & Service Layer

**Task 1**: Update Prisma schema
```prisma
// packages/db/prisma/schema.prisma

model Goal {
  id            String     @id @default(uuid())
  userId        String     @map("user_id")
  projectId     String     @map("project_id")
  type          GoalType
  targetMinutes Int        @map("target_minutes")
  startDate     DateTime   @map("start_date")
  endDate       DateTime   @map("end_date")
  repeat        Boolean    @default(false)
  status        GoalStatus @default(ACTIVE)
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@map("goals")
}

model GoalProgress {
  id           String   @id @default(uuid())
  goalId       String   @map("goal_id")
  periodStart  DateTime @map("period_start")
  periodEnd    DateTime @map("period_end")
  totalMinutes Int      @map("total_minutes") @default(0)
  updatedAt    DateTime @updatedAt @map("updated_at")

  goal Goal @relation(fields: [goalId], references: [id])

  @@unique([goalId, periodStart])
  @@map("goal_progress")
}

enum GoalType {
  DAILY
  WEEKLY
  MONTHLY
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  FAILED
  ARCHIVED
}
```

**Task 2**: Create GoalService
```typescript
// apps/web/src/lib/services/goal.service.ts
export class GoalService {
  async create(data: CreateGoalInput): Promise<Goal>
  async update(id: string, data: UpdateGoalInput): Promise<Goal>
  async delete(id: string): Promise<void>
  async getById(id: string): Promise<Goal | null>
  async getByUser(userId: string): Promise<Goal[]>
  async getActiveByProject(projectId: string): Promise<Goal[]>
  async calculateProgress(goalId: string): Promise<GoalProgress>
  async updateAllProgress(): Promise<void> // Cron job
}
```

**Task 3**: Server Actions
```typescript
// apps/web/src/app/actions/goals.ts
'use server'
export async function createGoal(formData: FormData)
export async function updateGoal(id: string, formData: FormData)
export async function deleteGoal(id: string)
```

#### Day 3-4: Progress Calculation

**Task 4**: Progress calculator
```typescript
// packages/core/src/goals/calculator.ts
export function calculateGoalProgress(
  goal: Goal,
  sessions: Session[]
): GoalProgress {
  const periodSessions = sessions.filter(s =>
    s.startTime >= goal.startDate &&
    s.startTime <= goal.endDate &&
    s.projectId === goal.projectId
  );

  const totalMinutes = periodSessions.reduce(
    (sum, s) => sum + Math.floor(s.durationSeconds / 60),
    0
  );

  return {
    goalId: goal.id,
    periodStart: goal.startDate,
    periodEnd: goal.endDate,
    totalMinutes,
    percentage: Math.min(100, (totalMinutes / goal.targetMinutes) * 100),
    status: totalMinutes >= goal.targetMinutes ? 'COMPLETED' : 'ON_TRACK'
  };
}
```

**Task 5**: Hook useGoals
```typescript
// packages/hooks/src/useGoals.ts
export function useGoals(projectId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, [projectId]);

  // ... CRUD operations
  return { goals, loading, create, update, delete };
}
```

### Week 2: UI + Integration

#### Day 5-6: UI Components

**Task 6**: GoalForm component
```
packages/ui/src/composite/Goal/
├── GoalForm.tsx        # Create/edit form
├── GoalCard.tsx        # Single goal display
├── GoalProgress.tsx    # Progress bar/ring
├── GoalList.tsx        # List of goals
└── index.ts
```

**Task 7**: Dashboard integration
- Add goals section to `/dashboard`
- Show active goals with progress
- Quick create from dashboard

#### Day 7-8: Pages + Polish

**Task 8**: Goals page
```typescript
// apps/web/src/app/(app)/goals/page.tsx
// List all goals, create new, filter by status/project
```

**Task 9**: Goal notifications
```typescript
// Trigger notifications at milestones
// 50%, 90%, 100%
```

#### Day 9-10: Testing + Deploy

**Task 10**: Tests
- Unit tests for calculator
- Integration tests for CRUD
- E2E test for full flow

**Task 11**: Deploy
- Push to production
- Update CHANGELOG
- Tag v1.1.0

---

## 📦 v1.2.0 — Mobile Apps (4 weeks)

### Week 1: Setup + Core

#### Day 1-2: Capacitor Setup

```bash
# Create mobile app
cd apps
pnpm create vite mobile --template react-ts
cd mobile

# Add Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard
pnpm add @capacitor/local-notifications @capacitor/splash-screen
pnpm add @capacitor/preferences @capacitor/status-bar

# Initialize
npx cap init "Timebeat" "app.timebeat.mobile"

# Add platforms
npx cap add android
npx cap add ios
```

#### Day 3-5: Shared Code Integration

```typescript
// apps/mobile/src/lib/shared.ts
// Import from packages
export { useTimerStore } from '@timebeat/core';
export { formatDuration, formatTime } from '@timebeat/utils';
export { TimerState, Project, Session } from '@timebeat/types';
export { TIMER_CONSTANTS } from '@timebeat/constants';
```

### Week 2: Core Screens

| Screen | Route | Features |
|--------|-------|----------|
| Home | `/` | Quick timer, recent projects |
| Timer | `/timer` | Full timer controls |
| Projects | `/projects` | Project list |
| Project | `/projects/:id` | Project details |
| Dashboard | `/dashboard` | Stats (simplified) |
| Settings | `/settings` | Mobile-specific settings |

### Week 3: Native Features

#### Background Timer (Android)

```kotlin
// android/app/src/main/java/.../TimerForegroundService.kt
class TimerForegroundService : Service() {
    // Foreground service for persistent timer
}
```

#### Local Notifications

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

async function scheduleBreakReminder(minutes: number) {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Break Time!',
        body: `You've been working for ${minutes} minutes`,
        id: 1,
        schedule: { at: new Date(Date.now() + minutes * 60 * 1000) },
      }
    ]
  });
}
```

### Week 4: Polish + Publish

#### App Store Submission

- [ ] Screenshots (6.5" and 5.5" iPhones)
- [ ] App description
- [ ] Privacy policy URL
- [ ] App Store Connect setup

#### Play Store Submission

- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic (1024x500)
- [ ] App description
- [ ] Play Console setup
- [ ] Content rating questionnaire

---

## 📦 v1.3.0 — Offline Sync (2 weeks)

### Week 1: Local Database

**SQLite with sql.js (Web) + native SQLite (Mobile)**

```typescript
// packages/db/src/local/index.ts
import initSqlJs from 'sql.js';

export async function initLocalDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions_local (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      start_time INTEGER,
      end_time INTEGER,
      duration_seconds INTEGER,
      sync_status TEXT DEFAULT 'pending',
      created_at INTEGER
    )
  `);

  return db;
}
```

### Week 2: Sync Engine

```typescript
// packages/core/src/sync/engine.ts
export class SyncEngine {
  private queue: SyncQueue;
  private supabase: SupabaseClient;

  async push(): Promise<SyncResult> {
    const pending = await this.queue.getPending();
    for (const item of pending) {
      try {
        await this.pushItem(item);
        await this.queue.markComplete(item.id);
      } catch (error) {
        await this.queue.markFailed(item.id, error.message);
      }
    }
  }

  async pull(): Promise<void> {
    const lastSync = await this.getLastSyncTime();
    const remote = await this.fetchRemoteChanges(lastSync);
    await this.applyRemoteChanges(remote);
  }
}
```

---

## 📦 v2.0.0 — Cloud Sync (3 weeks)

### Features

1. **Realtime Sync** — Supabase Realtime subscriptions
2. **Conflict UI** — Show conflicts to user
3. **Advanced Analytics** — Detailed reports
4. **Data Export** — CSV, JSON export
5. **Pomodoro Mode** — Full workflow

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   Web   │  │ Desktop │  │   iOS   │  │ Android │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │  Sync Core  │                          │
│                    │  (shared)   │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │                         │                    │
│       ┌──────┴──────┐          ┌───────┴───────┐           │
│       │ Local Store │          │ Sync Engine   │           │
│       │  (SQLite)   │          │ (Outbox)      │           │
│       └─────────────┘          └───────┬───────┘           │
└────────────────────────────────────────┼────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Realtime   │  │     Auth     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Metrics

| Version | Metric | Target |
|---------|--------|--------|
| v1.1.0 | Users with goals | > 50% of active users |
| v1.2.0 | Mobile downloads | 500+ in first month |
| v1.3.0 | Offline sessions | < 1% data loss |
| v2.0.0 | Multi-device users | > 30% |

---

## 🔧 Tools & Resources

### Development

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Tauri v2 Docs**: https://v2.tauri.app
- **Supabase Realtime**: https://supabase.com/docs/guides/realtime

### Testing

- **Vitest**: Unit tests
- **Playwright**: E2E tests
- **Appium**: Mobile E2E (optional)

### CI/CD

- **GitHub Actions**: Build + deploy
- **Vercel**: Web hosting
- **App Store Connect**: iOS distribution
- **Play Console**: Android distribution

---

## 📝 Notes

- Each phase builds on previous work
- Mobile reuses 80%+ of web code
- Sync engine is platform-agnostic
- All features maintain offline-first philosophy

---

*Last updated: 2026-03-12*
