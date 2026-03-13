# 🗺️ Timebeat — Roadmap

> Release planning and milestones

---

## 📅 Overview

| Version | Codename  | Focus                        | Target     | Status         |
| ------- | --------- | ---------------------------- | ---------- | -------------- |
| v0.1.0  | Bootstrap | Project setup, architecture  | 2026-03-04 | ✅ Done        |
| v0.2.0  | Core      | Timer, projects, basic UI    | 2026-03-10 | ✅ Done        |
| v0.3.0  | Tasks     | Task management, dashboard   | 2026-03-11 | ✅ Done        |
| v0.4.0  | Desktop   | Tauri integration, tray      | 2026-03-12 | ✅ Done        |
| v1.0.0  | MVP       | Full P0, ready for daily use | 2026-03-12 | ✅ **Current** |
| v1.1.0  | Goals     | Goals & objectives system    | Q2 2026    | 📋 Planned     |
| v1.2.0  | Mobile    | iOS & Android apps           | Q2 2026    | 📋 Planned     |
| v2.0.0  | Cloud     | Full sync, advanced features | Q3 2026    | 💭 Future      |

---

## ✅ v0.1.0 — Bootstrap

**Status**: ✅ Complete
**Released**: 2026-03-04

### Deliverables

- [x] Monorepo structure (Turborepo)
- [x] Package configuration (pnpm workspace)
- [x] TypeScript setup
- [x] Prisma schema design
- [x] Shared packages (types, constants, utils)
- [x] Timer state machine (core logic)
- [x] Documentation (README, BACKLOG, ROADMAP)
- [x] Git init + initial commit

---

## ✅ v0.2.0 — Core

**Status**: ✅ Complete
**Released**: 2026-03-10

### Deliverables

- [x] Next.js 15 app setup
- [x] Tailwind CSS 4 configuration
- [x] Supabase client integration
- [x] Authentication flows (signup, login, logout)
- [x] Project CRUD operations
- [x] Timer component (start, pause, stop)
- [x] Basic session storage
- [x] Responsive layout

---

## ✅ v0.3.0 — Tasks

**Status**: ✅ Complete
**Released**: 2026-03-11

### Deliverables

- [x] Task CRUD within projects
- [x] Task selection for timer
- [x] Dashboard component
- [x] Today's stats display
- [x] Time breakdown charts (Recharts)
- [x] Recent sessions list
- [x] Settings page (theme, notifications)

---

## ✅ v0.4.0 — Desktop

**Status**: ✅ Complete
**Released**: 2026-03-12

### Deliverables

- [x] Tauri v2 project setup
- [x] System tray icon
- [x] Timer display in tray
- [x] Native notifications
- [x] Tray menu with quick actions
- [x] IPC commands for timer control

---

## ✅ v1.0.0 — MVP (Current Release)

**Status**: ✅ Complete
**Released**: 2026-03-12

### Deliverables

- [x] All P0 features from BACKLOG (35/42, 7 deferred)
- [x] Polish and bug fixes
- [x] Error boundaries
- [x] Loading states
- [x] PWA support (manifest, icons)
- [x] 404 page
- [x] ~40 UI components

### Stats

- **Pages**: 11 (4 static, 7 dynamic)
- **Components**: ~40
- **Build size**: 102 kB shared JS
- **Build time**: < 5s (cached)

---

## 📋 v1.1.0 — Goals

**Status**: 📋 Planned
**Target**: Q2 2026

### Deliverables

- [ ] Goal creation (daily/weekly/monthly)
- [ ] Goal progress tracking
- [ ] Goal notifications
- [ ] Goals dashboard section
- [ ] Historical goal completion
- [ ] Deferred P0 features (sounds, timezone, etc.)

### Acceptance Criteria

- User can set time goals per project
- Progress is tracked automatically
- Notifications when goal is achieved

---

## 📋 v1.2.0 — Mobile

**Status**: 📋 Planned
**Target**: Q2 2026

### Deliverables

- [ ] Capacitor 6 integration
- [ ] Mobile-optimized UI
- [ ] Background timer (Android foreground service)
- [ ] iOS Background Task support
- [ ] Local notifications
- [ ] App Store / Play Store submission

### Acceptance Criteria

- Apps run on iOS and Android
- Timer works in background
- Syncs with web/desktop

---

## 💭 v2.0.0 — Cloud

**Status**: 💭 Future
**Target**: Q3 2026

### Deliverables

- [ ] Offline-first with SQLite
- [ ] Realtime sync (Supabase Realtime)
- [ ] Conflict resolution
- [ ] Advanced analytics
- [ ] Data export (CSV, JSON)
- [ ] Full Pomodoro mode

### Acceptance Criteria

- Works fully offline
- Syncs automatically when online
- Handles conflicts gracefully

---

## 📊 Progress Tracking

```
v0.1.0  [████████████████████] 100% ✅
v0.2.0  [████████████████████] 100% ✅
v0.3.0  [████████████████████] 100% ✅
v0.4.0  [████████████████████] 100% ✅
v1.0.0  [████████████████████] 100% ✅ ← CURRENT
v1.1.0  [░░░░░░░░░░░░░░░░░░░░]   0%
v1.2.0  [░░░░░░░░░░░░░░░░░░░░]   0%
v2.0.0  [░░░░░░░░░░░░░░░░░░░░]   0%
```

---

## 📝 Version History

| Version | Date       | Notes                             |
| ------- | ---------- | --------------------------------- |
| v1.0.0  | 2026-03-12 | **MVP Release** — All P0 features |
| v0.4.0  | 2026-03-12 | Desktop app with Tauri            |
| v0.3.0  | 2026-03-11 | Tasks & Dashboard                 |
| v0.2.0  | 2026-03-10 | Core functionality                |
| v0.1.0  | 2026-03-04 | Bootstrap complete                |

---

_Last updated: 2026-03-12_
