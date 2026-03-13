# 📜 Changelog

All notable changes to Timebeat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Mobile apps (Capacitor 6)
- Full offline sync
- Goals & objectives system
- Advanced analytics

---

## [1.0.1] - 2026-03-13

### Fixed

- Vercel deployment configuration for monorepo
- Simplified `vercel.json` with `outputDirectory: ".next"` only
- Desktop build: cross-env for Windows compatibility
- Desktop build: universal macOS binary (Intel + Apple Silicon)
- CI workflow: correct rust-toolchain action name
- ESLint configuration for monorepo root

---

## [1.0.0] - 2026-03-12

### 🎉 MVP Release

First complete release with all P0 features implemented.

### Added

**Authentication**

- Email/password signup and login
- Magic link authentication
- Session persistence with Supabase
- Protected routes with middleware
- Password reset flow

**Projects Management**

- Create project with name, color, icon
- Edit project details
- Archive/delete project
- Project list with grid view
- Project detail view with stats

**Time Tracking**

- Timer with free mode (unlimited)
- Timer with timed mode (set duration)
- Pause/Resume functionality
- Stop timer and auto-save session
- Timer persists on page refresh (Zustand persist)
- Project selection before starting

**Tasks Management**

- Create tasks within projects
- Task selection for timer
- Task completion tracking
- Task list per project

**Dashboard**

- Today's total time
- Time breakdown by project (pie chart)
- Weekly trend chart (bar chart)
- Recent sessions list
- Quick timer access

**Settings**

- Timer mode preferences (free/timed)
- Default duration settings
- Notification preferences
- Theme selection (light/dark/system)
- User profile management

**Desktop App (Tauri v2)**

- System tray integration
- Timer display in tray
- Tray menu with quick actions
- Native notifications
- IPC commands for timer control

**PWA & Polish**

- PWA manifest with icons
- App shortcuts (Timer, Dashboard)
- Error boundaries (page + global)
- Loading states with spinners
- 404 page
- Responsive design

**UI Library (~40 components)**

- Primitives: Button, Input, Select, Card, Badge, etc.
- Composite: Timer, Project, Task, Dashboard components
- Layout: AppShell, Sidebar, Header, PageContainer
- Providers: ThemeProvider, ToastProvider

### Technical

- Next.js 15 with App Router
- React 19 with Server Components
- Tailwind CSS 4 with CSS variables
- Supabase Auth + PostgreSQL
- Prisma 6 ORM
- Zustand state management
- Recharts for data visualization
- Tauri v2 for desktop

---

## [0.4.0] - 2026-03-12

### Added

- Tauri v2 desktop app setup
- System tray with timer state
- IPC commands (get/update timer, notifications)
- Tauri capabilities and permissions
- Rust backend with `tray-icon` plugin

---

## [0.3.0] - 2026-03-11

### Added

- Dashboard with stats cards
- Weekly chart (Recharts BarChart)
- Projects chart (Recharts PieChart)
- Task service layer
- Task server actions
- Settings page with forms
- Notification permission flow
- Theme selector component

---

## [0.2.0] - 2026-03-10

### Added

- Next.js 15 app in `apps/web/`
- Tailwind CSS 4 configuration
- Supabase client (browser + server)
- Authentication flows (signup, login, logout, magic link)
- Auth middleware for protected routes
- Project CRUD with service layer
- Project server actions
- Timer page with full controls
- Timer UI components
- Session service layer

---

## [0.1.0] - 2026-03-04

### Added

- Initial project structure (monorepo with Turborepo)
- Package configuration (pnpm workspace)
- Core packages:
  - `@timebeat/types` — Shared TypeScript types and enums
  - `@timebeat/constants` — Application constants
  - `@timebeat/utils` — Utility functions (30+ utils)
  - `@timebeat/db` — Prisma schema and database client
  - `@timebeat/core` — Business logic (timer state machine)
  - `@timebeat/ui` — Shared UI components (stub)
  - `@timebeat/hooks` — React hooks (5 hooks)
- Prisma schema with all entities
- Documentation (README, BACKLOG, ROADMAP)
- Architecture Decision Records (ADRs)

---

## Version History

| Version | Date       | Codename  | Status     |
| ------- | ---------- | --------- | ---------- |
| 1.0.1   | 2026-03-13 | Hotfix    | ✅ Current |
| 1.0.0   | 2026-03-12 | MVP       | ✅ Done    |
| 0.4.0   | 2026-03-12 | Desktop   | ✅ Done    |
| 0.3.0   | 2026-03-11 | Tasks     | ✅ Done    |
| 0.2.0   | 2026-03-10 | Core      | ✅ Done    |
| 0.1.0   | 2026-03-04 | Bootstrap | ✅ Done    |

---

[Unreleased]: https://github.com/kiki/timebeat/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/kiki/timebeat/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/kiki/timebeat/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/kiki/timebeat/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kiki/timebeat/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/kiki/timebeat/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/kiki/timebeat/releases/tag/v0.1.0
