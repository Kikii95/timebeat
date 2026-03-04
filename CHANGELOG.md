# 📜 Changelog

All notable changes to Timebeat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Core timer functionality
- Project management
- Basic dashboard
- Desktop tray integration

---

## [0.0.1] - 2026-03-04

### Added
- Initial project structure (monorepo with Turborepo)
- Package configuration (pnpm workspace)
- Core packages:
  - `@timebeat/types` — Shared TypeScript types and enums
  - `@timebeat/constants` — Application constants
  - `@timebeat/utils` — Utility functions
  - `@timebeat/db` — Prisma schema and database client
  - `@timebeat/core` — Business logic (timer state machine)
  - `@timebeat/ui` — Shared UI components (stub)
  - `@timebeat/hooks` — React hooks
- Prisma schema with all entities:
  - User, UserSettings
  - Project, Task
  - Session, Break
  - Goal, SyncOutbox
  - DailyStats
- Documentation:
  - README.md — Project overview
  - BACKLOG.md — Feature backlog (P0→P3)
  - ROADMAP.md — Release planning
  - CHANGELOG.md — This file
- Architecture Decision Records (ADRs):
  - ADR-001: Stack choice
  - ADR-002: Offline-first architecture
- Feature specifications:
  - Timer specification
  - Notifications specification
- Project configuration:
  - `.gitignore`
  - `.env.example`
  - `tsconfig.json`
  - `turbo.json`
  - `pnpm-workspace.yaml`

### Technical Decisions
- Monorepo architecture with Turborepo
- Next.js 15 + React 19 for frontend
- Tauri v2 for desktop (Windows)
- Capacitor 6 for mobile (iOS/Android)
- Supabase for backend (PostgreSQL + Auth + Realtime)
- Zustand for state management
- Offline-first with SQLite + outbox pattern

---

## Version History

| Version | Date | Codename |
|---------|------|----------|
| 0.0.1 | 2026-03-04 | Bootstrap |

---

[Unreleased]: https://github.com/kiki/timebeat/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/kiki/timebeat/releases/tag/v0.0.1
