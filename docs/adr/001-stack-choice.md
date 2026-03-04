# ADR-001: Stack Choice

**Status**: Accepted
**Date**: 2026-03-04
**Deciders**: kiki

## Context

Building a cross-platform time tracking app (Timebeat) that needs to run on:
- Desktop Windows (primary)
- Web (PWA)
- Mobile iOS & Android (secondary)

Requirements:
- Single codebase (maximize code sharing)
- Native-feeling desktop app
- Offline support
- Fast development iteration
- Small bundle size

## Decision

### Frontend: Next.js 15 + React 19 + Tailwind CSS 4

**Chosen over**: Remix, SvelteKit, vanilla React

**Rationale**:
- Next.js 15 has excellent SSG for desktop bundling
- React 19 brings performance improvements
- Tailwind 4 is faster and more flexible
- Largest ecosystem for UI components
- Strong TypeScript support

### Desktop: Tauri v2

**Chosen over**: Electron, Wails, Neutralino

**Rationale**:
- ~20MB bundle vs ~150MB for Electron
- Rust backend for performance and security
- Native system tray support
- Active development and community
- Uses system webview (no Chromium bundled)

### Mobile: Capacitor 6

**Chosen over**: React Native, Flutter, Expo

**Rationale**:
- Shares web codebase (one React codebase)
- Native capabilities (background tasks, notifications)
- Simpler than React Native for web-first apps
- Good plugin ecosystem
- Easier to maintain than separate native apps

### Backend: Supabase

**Chosen over**: Firebase, custom backend, PocketBase

**Rationale**:
- PostgreSQL (familiar, powerful)
- Built-in Auth with multiple providers
- Realtime subscriptions out of the box
- Row-level security for multi-tenancy
- Generous free tier
- Self-hostable if needed

### State Management: Zustand

**Chosen over**: Redux, Jotai, Recoil, MobX

**Rationale**:
- Minimal boilerplate
- Built-in persist middleware (critical for timer)
- TypeScript-first
- Small bundle size
- Works great with React 19

### ORM: Prisma 6

**Chosen over**: Drizzle, TypeORM, Kysely

**Rationale**:
- Best TypeScript integration
- Schema-first approach
- Excellent migrations
- Supabase compatible
- Visual studio for debugging

### Build Tool: Turborepo

**Chosen over**: Nx, Lerna, Rush

**Rationale**:
- Incremental builds
- Remote caching
- Simple configuration
- Works great with pnpm
- Vercel support

## Consequences

### Positive
- Maximum code sharing between platforms
- Fast development with hot reload
- Strong typing throughout
- Modern tooling
- Active communities

### Negative
- Tauri requires Rust knowledge for native features
- Capacitor has less native capability than React Native
- Multiple runtimes to manage (Node, Rust, mobile)
- Supabase vendor lock-in (mitigated by Postgres standard)

### Risks
- Tauri v2 is relatively new (may have edge cases)
- React 19 concurrent features need careful handling
- Offline sync complexity increases with features

## Alternatives Considered

### Full Native (Swift + Kotlin)
Rejected: Too much duplication, slower development

### React Native Everywhere
Rejected: Web support not as mature, no desktop

### Electron
Rejected: Bundle size unacceptable for simple app

### Firebase
Rejected: NoSQL less suitable, vendor lock-in concerns

---

*This ADR documents why we chose this specific stack for Timebeat.*
