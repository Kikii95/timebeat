# 🗺️ Timebeat — Roadmap

> Release planning and milestones

---

## 📅 Overview

| Version | Codename | Focus | Target |
|---------|----------|-------|--------|
| v0.1.0 | Bootstrap | Project setup, architecture | ✅ Done |
| v0.2.0 | Core | Timer, projects, basic UI | Q1 2026 |
| v0.3.0 | Tasks | Task management, dashboard | Q1 2026 |
| v0.4.0 | Desktop | Tauri integration, tray | Q1 2026 |
| v1.0.0 | MVP | Full P0, ready for daily use | Q2 2026 |
| v1.1.0 | Goals | Goals & objectives system | Q2 2026 |
| v1.2.0 | Mobile | iOS & Android apps | Q2 2026 |
| v2.0.0 | Cloud | Full sync, advanced features | Q3 2026 |

---

## 🎯 v0.1.0 — Bootstrap (Current)

**Status**: ✅ In Progress
**Focus**: Project foundation

### Deliverables
- [x] Monorepo structure (Turborepo)
- [x] Package configuration (pnpm workspace)
- [x] TypeScript setup
- [x] Prisma schema design
- [x] Shared packages (types, constants, utils)
- [x] Timer state machine (core logic)
- [x] Documentation (README, BACKLOG, ROADMAP)
- [ ] Git init + initial commit

### Technical Decisions
- Monorepo with Turborepo
- Supabase for backend
- Tauri v2 for desktop
- Zustand for state management

---

## 🎯 v0.2.0 — Core

**Status**: 📋 Planned
**Focus**: Basic functionality

### Deliverables
- [ ] Next.js 15 app setup
- [ ] Tailwind CSS 4 configuration
- [ ] Supabase client integration
- [ ] Authentication flows (signup, login, logout)
- [ ] Project CRUD operations
- [ ] Timer component (start, pause, stop)
- [ ] Basic session storage
- [ ] Responsive layout

### Acceptance Criteria
- User can sign up and log in
- User can create/edit/delete projects
- User can start/pause/stop timer
- Sessions are saved to database

---

## 🎯 v0.3.0 — Tasks

**Status**: 📋 Planned
**Focus**: Task management & dashboard

### Deliverables
- [ ] Task CRUD within projects
- [ ] Task selection for timer
- [ ] Dashboard component
- [ ] Today's stats display
- [ ] Time breakdown charts (Recharts)
- [ ] Recent sessions list
- [ ] Settings page (theme, notifications)

### Acceptance Criteria
- User can create tasks per project
- User can track time against specific tasks
- Dashboard shows daily summary
- Basic charts working

---

## 🎯 v0.4.0 — Desktop

**Status**: 📋 Planned
**Focus**: Tauri desktop application

### Deliverables
- [ ] Tauri v2 project setup
- [ ] System tray icon
- [ ] Timer display in tray
- [ ] Native notifications
- [ ] Startup on boot (optional)
- [ ] Minimize to tray
- [ ] Quick actions from tray menu

### Acceptance Criteria
- Desktop app builds and runs
- Timer visible in system tray
- Native notifications working
- App runs in background

---

## 🎯 v1.0.0 — MVP

**Status**: 📋 Planned
**Focus**: Complete P0 features

### Deliverables
- [ ] All P0 features from BACKLOG
- [ ] Polish and bug fixes
- [ ] Performance optimization
- [ ] Windows installer
- [ ] PWA support
- [ ] User documentation

### Acceptance Criteria
- All P0 features working
- No critical bugs
- Usable for daily tracking
- < 3s initial load time

---

## 🎯 v1.1.0 — Goals

**Status**: 📋 Planned
**Focus**: Goals & objectives

### Deliverables
- [ ] Goal creation (daily/weekly/monthly)
- [ ] Goal progress tracking
- [ ] Goal notifications
- [ ] Goals dashboard section
- [ ] Historical goal completion

### Acceptance Criteria
- User can set time goals per project
- Progress is tracked automatically
- Notifications when goal is achieved

---

## 🎯 v1.2.0 — Mobile

**Status**: 📋 Planned
**Focus**: iOS & Android apps

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

## 🎯 v2.0.0 — Cloud

**Status**: 💭 Future
**Focus**: Full sync & advanced features

### Deliverables
- [ ] Offline-first with SQLite
- [ ] Realtime sync (Supabase Realtime)
- [ ] Conflict resolution
- [ ] Advanced analytics
- [ ] Data export
- [ ] Pomodoro mode

### Acceptance Criteria
- Works fully offline
- Syncs automatically when online
- Handles conflicts gracefully

---

## 📊 Progress Tracking

```
v0.1.0  [████████████████████] 100% ✅
v0.2.0  [░░░░░░░░░░░░░░░░░░░░]   0%
v0.3.0  [░░░░░░░░░░░░░░░░░░░░]   0%
v0.4.0  [░░░░░░░░░░░░░░░░░░░░]   0%
v1.0.0  [░░░░░░░░░░░░░░░░░░░░]   0%
```

---

## 📝 Version History

| Version | Date | Notes |
|---------|------|-------|
| v0.1.0 | 2026-03-04 | Bootstrap complete |

---

*Last updated: 2026-03-04*
