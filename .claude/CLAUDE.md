# Timebeat — Claude Instructions

## 🎵 Project Overview

**Timebeat** is a cross-platform time tracking application for personal productivity.

| Attribute    | Value                       |
| ------------ | --------------------------- |
| **Name**     | timebeat                    |
| **Category** | perso                       |
| **Type**     | Monorepo (apps + packages)  |
| **Status**   | ✅ MVP v1.0.0 Released      |
| **Path**     | `~/projects/perso/timebeat` |

---

## 🏗️ Architecture

### Monorepo Structure

```
timebeat/
├── apps/
│   ├── web/          # Next.js 15 + React 19
│   ├── desktop/      # Tauri v2 (Rust)
│   └── mobile/       # Capacitor 6 (P1)
├── packages/
│   ├── ui/           # React components
│   ├── core/         # Business logic
│   ├── db/           # Prisma + Supabase
│   ├── types/        # TypeScript types
│   ├── constants/    # Shared constants
│   ├── utils/        # Utility functions
│   └── hooks/        # React hooks
└── docs/
    ├── adr/          # Architecture Decision Records
    └── specs/        # Feature specifications
```

### Tech Stack

| Layer    | Technology                       | Notes                        |
| -------- | -------------------------------- | ---------------------------- |
| Frontend | Next.js 15, React 19, Tailwind 4 | SSG for desktop              |
| Desktop  | Tauri v2                         | Rust backend, ~20MB          |
| Mobile   | Capacitor 6                      | iOS + Android                |
| Backend  | Supabase                         | PostgreSQL + Auth + Realtime |
| State    | Zustand                          | Persist middleware           |
| DB Local | SQLite                           | Offline-first                |
| ORM      | Prisma 6                         | Type-safe                    |

---

## 📚 Docs à Maintenir

### Docs Git (source) → sync Obsidian

| Doc       | Chemin Git     | Quand mettre à jour                     |
| --------- | -------------- | --------------------------------------- |
| Backlog   | `BACKLOG.md`   | Nouvelles features, changement priorité |
| Roadmap   | `ROADMAP.md`   | Nouveau milestone, changement planning  |
| Changelog | `CHANGELOG.md` | Chaque version/release                  |

### Docs Obsidian-only

| Doc   | Chemin Obsidian                  | Quand mettre à jour |
| ----- | -------------------------------- | ------------------- |
| Notes | `Projects/Perso/timebeat.md`     | Notes générales     |
| Logs  | `Projects/Perso/timebeat/_Logs/` | Chaque session      |

---

## 🗄️ Database

| Attribute   | Value                              |
| ----------- | ---------------------------------- |
| **DB Name** | timebeat (Supabase)                |
| **ORM**     | Prisma 6                           |
| **Schema**  | `packages/db/prisma/schema.prisma` |
| **Status**  | 🟡 Schema only (no migrations yet) |

### Entities

- `User`, `UserSettings`
- `Project`, `Task`
- `Session`, `Break`
- `Goal`, `SyncOutbox`
- `DailyStats`

---

## 🎯 Current Phase

**Phase**: ✅ MVP Complete (v1.0.0)
**Released**: 2026-03-12
**Next**: Goals (v1.1.0) — Goals & objectives system

### Completed in MVP

1. ✅ Next.js 15 app with 11 pages
2. ✅ Supabase Auth + PostgreSQL
3. ✅ Full authentication (email, magic link)
4. ✅ Timer with free/timed modes
5. ✅ Project CRUD
6. ✅ Task management
7. ✅ Dashboard with charts
8. ✅ Settings page
9. ✅ Desktop app (Tauri v2)
10. ✅ ~40 UI components

### Next Phase Tasks (v1.1.0)

1. Goals & objectives system
2. Deferred P0 features (sounds, timezone)
3. Mobile app planning (Capacitor)

---

## 💻 Commands

```bash
# Development
pnpm dev              # All apps
pnpm dev:web          # Web only
pnpm dev:desktop      # Desktop (Tauri)

# Build
pnpm build            # All apps
pnpm build:web        # Web only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to DB
pnpm --filter @timebeat/db db:studio  # Prisma Studio

# Quality
pnpm lint             # Lint all
pnpm check:types      # TypeScript check
pnpm test             # Run tests
pnpm clean            # Clean artifacts
```

---

## ⚠️ Critical Rules

### Code Quality

1. **Fichiers < 300 lignes** — Split en modules
2. **Fonctions < 50 lignes** — Extract helpers
3. **Routes handlers < 20 lignes** — Delegate to services
4. **Pas de magic numbers** — Use `@timebeat/constants`
5. **Service Layer obligatoire** — Pas de DB dans routes

### Architecture

1. **Packages partagés** — Toute logique réutilisable dans `packages/`
2. **Types centralisés** — Tout dans `@timebeat/types`
3. **Constants centralisées** — Tout dans `@timebeat/constants`
4. **Imports workspace** — `@timebeat/*` everywhere

### Offline-First

1. **Zustand persist** — Timer state survit aux refresh
2. **Outbox pattern** — Sessions queued si offline
3. **SQLite local** — Desktop/mobile DB locale
4. **Conflict resolution** — Last-write-wins (simple pour MVP)

---

## 📝 Conventions

### Git Commits

```
feat(timer): add pause/resume functionality
fix(auth): handle expired token gracefully
docs(readme): update installation steps
refactor(core): extract timer state machine
```

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Utils: `camelCase.ts`
- Constants: `SCREAMING_SNAKE.ts`
- Types: `PascalCase.ts`

### Import Order

1. External packages
2. `@timebeat/*` packages
3. Relative imports
4. Styles

---

## 🔗 Key Files

| Purpose     | Path                                          |
| ----------- | --------------------------------------------- |
| Root config | `package.json`, `turbo.json`, `tsconfig.json` |
| Workspace   | `pnpm-workspace.yaml`                         |
| DB Schema   | `packages/db/prisma/schema.prisma`            |
| Timer logic | `packages/core/src/timer/index.ts`            |
| Types       | `packages/types/src/index.ts`                 |
| Constants   | `packages/constants/src/index.ts`             |
| Utils       | `packages/utils/src/index.ts`                 |
| Hooks       | `packages/hooks/src/index.ts`                 |

---

## 🐛 Known Issues

- Desktop build requires static export (currently skipped in CI)
- PWA icons need to be generated (placeholder paths in manifest)

---

## 📅 Session History

| Date       | Focus     | Outcome                         |
| ---------- | --------- | ------------------------------- |
| 2026-03-04 | Bootstrap | Structure complete              |
| 2026-03-10 | Core      | Auth, Projects, Timer           |
| 2026-03-11 | Tasks     | Dashboard, Charts, Settings     |
| 2026-03-12 | MVP       | Desktop, Polish, Release v1.0.0 |

---

_Last updated: 2026-03-12_
