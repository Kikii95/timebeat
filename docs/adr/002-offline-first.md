# ADR-002: Offline-First Architecture

**Status**: Accepted
**Date**: 2026-03-04
**Deciders**: kiki

## Context

Timebeat must work reliably even without internet connection because:
- Users may have unstable connections
- Desktop app should work without network
- Mobile usage in transit/airplane mode
- Timer must never lose data

The challenge is synchronizing data between:
- Local storage (browser/app)
- Local SQLite database (desktop/mobile)
- Supabase PostgreSQL (cloud)

## Decision

### Architecture: Offline-First with Outbox Pattern

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────┐         ┌──────────────────┐      │
│   │   Zustand   │────────▶│  Local Storage   │      │
│   │   (State)   │         │  (Timer State)   │      │
│   └─────────────┘         └──────────────────┘      │
│         │                                           │
│         ▼                                           │
│   ┌─────────────┐                                   │
│   │   Service   │                                   │
│   │   Layer     │                                   │
│   └─────────────┘                                   │
│         │                                           │
│         ▼                                           │
│   ┌─────────────┐         ┌──────────────────┐      │
│   │   SQLite    │◀───────▶│   Sync Outbox    │      │
│   │   (Local)   │         │   (Queue)        │      │
│   └─────────────┘         └──────────────────┘      │
│                                  │                  │
└──────────────────────────────────│──────────────────┘
                                   │
                           (when online)
                                   │
                                   ▼
                         ┌──────────────────┐
                         │    Supabase      │
                         │   (PostgreSQL)   │
                         └──────────────────┘
```

### Local Storage Strategy

| Platform | Primary Storage | Fallback |
|----------|-----------------|----------|
| Web | IndexedDB | localStorage |
| Desktop (Tauri) | SQLite | — |
| Mobile (Capacitor) | SQLite | — |

### Sync Outbox Pattern

When offline:
1. Write operation happens
2. Data saved to local SQLite
3. Operation queued in `SyncOutbox` table
4. UI shows "pending sync" indicator

When online:
1. Sync service processes outbox queue
2. Operations sent to Supabase in order
3. Success → remove from outbox
4. Failure → increment retry count, try again later

### Conflict Resolution: Last-Write-Wins

For MVP, using simple LWW (Last Write Wins):
- Each record has `updatedAt` timestamp
- When syncing, server timestamp wins if newer
- Client notified of conflicts for manual review (future)

**Why LWW**:
- Simple to implement
- Good enough for single-user scenarios
- Can upgrade to CRDT later if needed

### Timer State Persistence

Critical: Timer must never lose data on crash/refresh.

```typescript
// Zustand persist middleware
const useTimerStore = create(
  persist(
    (set, get) => ({
      // ... state
    }),
    {
      name: 'timebeat:timer',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        state: state.state,
        currentSession: state.currentSession,
        elapsedSeconds: state.elapsedSeconds,
        // ... critical fields only
      }),
    }
  )
);
```

On app restart:
1. Load persisted timer state
2. If session was `RUNNING`:
   - Calculate elapsed time since last tick
   - Add to `elapsedSeconds`
   - Resume timer
3. Show "Session recovered" notification

### Data Flow

**Write (Create Session)**:
```
User stops timer
    ↓
Session saved to SQLite
    ↓
SyncOutbox entry created
    ↓
If online → immediate sync to Supabase
If offline → sync when connection restored
```

**Read (Dashboard)**:
```
Request data
    ↓
Query local SQLite
    ↓
Return immediately (fast)
    ↓
Background: check for remote updates
    ↓
If newer data → update local → notify UI
```

## Consequences

### Positive
- App works 100% offline
- Fast reads (local-first)
- Data never lost
- Users can work anywhere
- Reduced server load

### Negative
- Increased complexity
- Storage used on device
- Potential sync conflicts
- Need to handle edge cases

### Implementation Notes

1. **SQLite via Tauri**: Use `tauri-plugin-sql`
2. **SQLite via Capacitor**: Use `@capacitor-community/sqlite`
3. **Web fallback**: IndexedDB via `idb-keyval`
4. **Sync service**: Background worker checking outbox periodically
5. **Network detection**: Listen to `online`/`offline` events

### Future Improvements

- CRDT for real conflict resolution
- Selective sync (only sync certain data)
- Compression for large payloads
- Sync progress indicator
- Manual conflict resolution UI

---

*This ADR documents the offline-first architecture for Timebeat.*
