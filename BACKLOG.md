# 📋 Timebeat — Backlog

> Complete feature backlog organized by priority (P0 = MVP → P3 = Future)

---

## 🔴 P0 — MVP (Must Have)

### Projects Management
- [ ] **TB-001** Create project (name, type, stack, platform, color, icon)
- [ ] **TB-002** Edit project details
- [ ] **TB-003** Archive/delete project
- [ ] **TB-004** List projects with filtering (status, type)
- [ ] **TB-005** Project detail view with stats
- [ ] **TB-006** Attach README/notes to project

### Time Tracking Core
- [ ] **TB-010** Select project and start timer
- [ ] **TB-011** Free mode timer (no limit)
- [ ] **TB-012** Timed mode (set duration before starting)
- [ ] **TB-013** Pause/Resume timer
- [ ] **TB-014** Stop timer and save session
- [ ] **TB-015** Timer persists on page refresh/app restart
- [ ] **TB-016** Desktop tray icon with timer display
- [ ] **TB-017** Quick start from tray (recent projects)

### Tasks Management
- [ ] **TB-020** Create task within project
- [ ] **TB-021** Set task as current when starting timer
- [ ] **TB-022** Mark task as completed
- [ ] **TB-023** Task list view per project
- [ ] **TB-024** Task time tracking (estimated vs actual)
- [ ] **TB-025** Reorder tasks (drag & drop)

### Notifications
- [ ] **TB-030** Break reminder notification (configurable interval)
- [ ] **TB-031** Session end notification (timed mode)
- [ ] **TB-032** Warning for long sessions (>5h on same task)
- [ ] **TB-033** Desktop native notifications
- [ ] **TB-034** Sound alerts (toggleable)

### Dashboard Basic
- [ ] **TB-040** Today's total time
- [ ] **TB-041** Time breakdown by project (pie chart)
- [ ] **TB-042** Recent sessions list
- [ ] **TB-043** Active project indicator
- [ ] **TB-044** Quick timer access from dashboard

### Authentication
- [ ] **TB-050** Email/password signup
- [ ] **TB-051** Email/password login
- [ ] **TB-052** Magic link login
- [ ] **TB-053** Logout
- [ ] **TB-054** Password reset flow
- [ ] **TB-055** Session persistence

### Settings
- [ ] **TB-060** Pomodoro settings (work/break durations)
- [ ] **TB-061** Notification preferences
- [ ] **TB-062** Theme selection (light/dark/system)
- [ ] **TB-063** Timezone setting
- [ ] **TB-064** Sound on/off toggle

---

## 🟠 P1 — Enhanced (Should Have)

### Goals & Objectives
- [ ] **TB-100** Create time goal (project + period + target)
- [ ] **TB-101** Daily/weekly/monthly goal types
- [ ] **TB-102** Goal progress indicator
- [ ] **TB-103** Goal completion notifications
- [ ] **TB-104** Goals overview page
- [ ] **TB-105** Remaining time calculation

### Dashboard Advanced
- [ ] **TB-110** Week view with daily breakdown
- [ ] **TB-111** Month view calendar heatmap
- [ ] **TB-112** Time by category/stack chart
- [ ] **TB-113** Trend analysis (this week vs last)
- [ ] **TB-114** Productivity score
- [ ] **TB-115** Export data (CSV, JSON)

### Mobile Apps
- [ ] **TB-120** iOS app via Capacitor
- [ ] **TB-121** Android app via Capacitor
- [ ] **TB-122** Mobile-optimized UI
- [ ] **TB-123** Background timer (foreground service Android)
- [ ] **TB-124** Widget for quick start
- [ ] **TB-125** iOS Background Task support

### Offline Support
- [ ] **TB-130** Local SQLite database
- [ ] **TB-131** Offline session recording
- [ ] **TB-132** Sync queue (outbox pattern)
- [ ] **TB-133** Conflict resolution
- [ ] **TB-134** Sync status indicator
- [ ] **TB-135** Manual sync trigger

---

## 🟡 P2 — Nice to Have

### Advanced Notifications
- [ ] **TB-200** Hydration reminders
- [ ] **TB-201** Stretch break reminders
- [ ] **TB-202** Fresh air reminder
- [ ] **TB-203** Custom reminder scheduling
- [ ] **TB-204** Notification sounds library
- [ ] **TB-205** Do not disturb mode

### Cloud Sync
- [ ] **TB-210** Realtime sync between devices
- [ ] **TB-211** Automatic cloud backup
- [ ] **TB-212** Sync conflict UI
- [ ] **TB-213** Sync history/audit log
- [ ] **TB-214** Data export to cloud storage

### Pomodoro Mode
- [ ] **TB-220** Full Pomodoro workflow
- [ ] **TB-221** Pomodoro counter
- [ ] **TB-222** Auto-start next pomodoro
- [ ] **TB-223** Long break after X sessions
- [ ] **TB-224** Pomodoro statistics

### Tags & Categories
- [ ] **TB-230** Custom tags for projects/tasks
- [ ] **TB-231** Filter by tags
- [ ] **TB-232** Tag-based reports
- [ ] **TB-233** Bulk tag management

---

## 🟢 P3 — Future

### Integrations
- [ ] **TB-300** GitHub integration (auto-track commits)
- [ ] **TB-301** Calendar sync (Google, Outlook)
- [ ] **TB-302** Trello/Notion import
- [ ] **TB-303** VS Code extension
- [ ] **TB-304** Slack status sync
- [ ] **TB-305** API for third-party apps

### Automation
- [ ] **TB-310** Auto-start on app launch
- [ ] **TB-311** Auto-pause on screen lock
- [ ] **TB-312** Activity detection
- [ ] **TB-313** Smart project suggestions
- [ ] **TB-314** Scheduled reports

### Social Features
- [ ] **TB-320** Share stats (image export)
- [ ] **TB-321** Team workspaces
- [ ] **TB-322** Leaderboards (opt-in)
- [ ] **TB-323** Collaborative goals

### AI Features
- [ ] **TB-330** Time estimation suggestions
- [ ] **TB-331** Productivity insights
- [ ] **TB-332** Schedule optimization
- [ ] **TB-333** Natural language task creation

---

## 📊 Status Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🚧 | In progress |
| ✅ | Completed |
| ❌ | Cancelled |
| 🔄 | Blocked |

---

## 📝 Notes

- P0 features are required for initial release
- P1 features targeted for v1.0
- P2/P3 features based on user feedback
- Feature IDs (TB-XXX) for tracking

---

*Last updated: 2026-03-04*
