# 🎵 Timebeat

> Cross-platform time tracking app for personal productivity

**Track your work time, stay focused, achieve your goals.**

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Status](https://img.shields.io/badge/status-bootstrap-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Overview

Timebeat is a personal time tracking application designed for developers and creators who want to understand and optimize how they spend their time. Built with a modern tech stack, it runs on Desktop (Windows), Web, and Mobile (iOS/Android).

### Key Features

- **⏱️ Flexible Timer** — Free mode or time-boxed sessions (Pomodoro-ready)
- **📊 Project Tracking** — Organize time by projects, tasks, and categories
- **🔔 Smart Notifications** — Break reminders, session alerts, hydration tips
- **📱 Cross-Platform** — Desktop, Web, and Mobile sync seamlessly
- **🌐 Offline-First** — Works without internet, syncs when connected
- **📈 Rich Analytics** — Daily/weekly/monthly stats and trends

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Desktop** | Tauri v2 (Rust backend, ~20MB) |
| **Mobile** | Capacitor 6 (iOS & Android) |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **State** | Zustand with persist middleware |
| **Charts** | Recharts |
| **Offline DB** | SQLite via Tauri/Capacitor |

---

## 📦 Project Structure

```
timebeat/
├── apps/
│   ├── web/          # Next.js 15 application
│   ├── desktop/      # Tauri v2 wrapper
│   └── mobile/       # Capacitor wrapper (P1)
├── packages/
│   ├── ui/           # Shared React components
│   ├── core/         # Business logic (timer, sync)
│   ├── db/           # Prisma schema & client
│   ├── types/        # TypeScript types
│   ├── constants/    # Shared constants
│   ├── utils/        # Utility functions
│   └── hooks/        # React hooks
├── docs/
│   ├── adr/          # Architecture Decision Records
│   └── specs/        # Feature specifications
└── tools/
    └── scripts/      # Build & automation scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Rust (for Tauri desktop app)
- Supabase CLI (optional, for local dev)

### Installation

```bash
# Clone repository
git clone https://github.com/kiki/timebeat.git
cd timebeat

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma client
pnpm db:generate

# Start development
pnpm dev:web      # Web only
pnpm dev:desktop  # Desktop app
pnpm dev          # All apps
```

### Development Commands

```bash
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all apps
pnpm lint          # Lint all packages
pnpm check:types   # TypeScript check
pnpm test          # Run tests
pnpm clean         # Clean all build artifacts
```

---

## 📊 Database

Using Supabase PostgreSQL with Prisma ORM.

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Open Prisma Studio
pnpm --filter @timebeat/db db:studio
```

---

## 🎨 Design Principles

1. **Offline-First** — App works without internet, syncs when available
2. **Privacy-Focused** — Your data, your control
3. **Minimal Friction** — One click to start tracking
4. **Cross-Platform Parity** — Same experience everywhere
5. **Performance** — Fast startup, low memory footprint

---

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed planning.

| Phase | Focus | Status |
|-------|-------|--------|
| **P0** | Core timer, projects, basic dashboard | 🚧 In Progress |
| **P1** | Goals, advanced analytics, mobile | 📋 Planned |
| **P2** | Notifications, cloud sync | 📋 Planned |
| **P3** | Integrations, automation | 💭 Future |

---

## 📝 Documentation

- [BACKLOG.md](./BACKLOG.md) — Feature backlog (P0→P3)
- [ROADMAP.md](./ROADMAP.md) — Release planning
- [CHANGELOG.md](./CHANGELOG.md) — Version history
- [docs/adr/](./docs/adr/) — Architecture decisions
- [docs/specs/](./docs/specs/) — Feature specifications

---

## 🤝 Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) — Lightweight desktop apps
- [Supabase](https://supabase.com/) — Backend as a service
- [Turborepo](https://turbo.build/) — Monorepo tooling

---

**Built with ❤️ for productivity**
