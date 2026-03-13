# ⚡ Timebeat — Guide d'Optimisation

> Performance, bundle size, UX optimizations for production

---

## 📊 Current State (v1.0.0)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Shared JS | 102 kB | < 100 kB | 🟡 Close |
| Dashboard page | 213 kB | < 150 kB | 🔴 Needs work |
| Settings page | 166 kB | < 100 kB | 🔴 Needs work |
| LCP (estimate) | ~2.5s | < 2.5s | 🟡 Borderline |
| FID (estimate) | < 100ms | < 100ms | 🟢 Good |
| CLS (estimate) | ~0.1 | < 0.1 | 🟢 Good |

---

## 🎯 Priority Optimizations

### P0 — Critical (Before v1.1.0)

#### 1. Code Splitting for Charts
```typescript
// Current: Charts loaded on every page
import { WeeklyChart, ProjectsChart } from "@/components/charts";

// Optimized: Dynamic import with loading state
const WeeklyChart = dynamic(
  () => import("@/components/charts/WeeklyChart"),
  {
    loading: () => <Skeleton className="h-64" />,
    ssr: false
  }
);
```

**Impact**: -50-80 kB on non-dashboard pages

#### 2. Lazy Load Recharts
```typescript
// Create: packages/ui/src/utils/lazy-recharts.ts
export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
```

**Impact**: Dashboard loads faster, charts appear progressively

#### 3. Image Optimization
- Generate PWA icons (currently placeholder paths)
- Use `next/image` for all images
- Implement blur placeholders

```bash
# Generate icons
npx pwa-asset-generator ./public/logo.svg ./public/icons \
  --background "#1a1a2e" --splash-only false
```

#### 4. Route Prefetching Strategy
```typescript
// next.config.ts
export default {
  // Disable automatic prefetching, enable on hover
  experimental: {
    optimisticClientCache: false,
  }
}

// In Sidebar.tsx
<Link href="/dashboard" prefetch={false}>
  <span onMouseEnter={() => router.prefetch('/dashboard')}>
    Dashboard
  </span>
</Link>
```

---

### P1 — Important (v1.1.0 - v1.2.0)

#### 5. Bundle Analysis Setup
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true pnpm build"

# Install
pnpm add -D @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer(config);
```

#### 6. Tree Shaking Improvements
```typescript
// Bad: Import entire library
import { formatDuration, formatDate, formatTime } from "@timebeat/utils";

// Good: Import from specific file
import { formatDuration } from "@timebeat/utils/time";
import { formatDate, formatTime } from "@timebeat/utils/date";
```

Update `@timebeat/utils` exports:
```typescript
// packages/utils/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./time": "./src/time/index.ts",
    "./date": "./src/date/index.ts",
    "./format": "./src/format/index.ts"
  }
}
```

#### 7. Server Components Optimization
```typescript
// Move to Server Components where possible
// Current (Client)
"use client";
export function ProjectList({ projects }) { ... }

// Optimized (Server)
// No "use client" - renders on server
export async function ProjectList() {
  const projects = await projectService.getAll();
  return <ProjectListClient projects={projects} />;
}
```

#### 8. React Query / SWR for Data Fetching
```typescript
// Install
pnpm add @tanstack/react-query

// Setup provider
// apps/web/src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Use in components
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });
}
```

---

### P2 — Nice to Have (v2.0.0)

#### 9. Edge Runtime for API Routes
```typescript
// apps/web/src/app/api/timer/route.ts
export const runtime = 'edge';

export async function GET() {
  // Runs on edge, lower latency
}
```

#### 10. Streaming SSR
```typescript
// apps/web/src/app/(app)/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <Charts />
      </Suspense>
    </div>
  );
}
```

#### 11. Service Worker Caching
```typescript
// apps/web/src/sw.ts (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api' })
);
```

#### 12. Database Query Optimization
```typescript
// Bad: Multiple queries
const projects = await prisma.project.findMany();
const sessions = await prisma.session.findMany();

// Good: Single query with relations
const projectsWithSessions = await prisma.project.findMany({
  include: {
    sessions: {
      where: {
        startTime: { gte: startOfWeek() }
      },
      take: 10,
    },
    _count: { select: { sessions: true } }
  }
});
```

---

## 🔧 Performance Monitoring

### Setup Vercel Analytics
```typescript
// apps/web/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Marks
```typescript
// packages/utils/src/performance.ts
export function measurePageLoad() {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[Perf] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    }
  });

  observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
}
```

---

## 📦 Bundle Size Targets

| Package | Current | Target | Strategy |
|---------|---------|--------|----------|
| recharts | ~45 kB | 0 (lazy) | Dynamic import |
| @supabase/supabase-js | ~25 kB | ~25 kB | Keep (essential) |
| zustand | ~2 kB | ~2 kB | Keep (tiny) |
| framer-motion | ~30 kB | ~15 kB | Use subset |
| date-fns | ~10 kB | ~5 kB | Tree shake |

---

## ✅ Optimization Checklist

### Before v1.1.0
- [ ] Implement dynamic import for charts
- [ ] Generate PWA icons
- [ ] Setup bundle analyzer
- [ ] Add React Query for caching

### Before v1.2.0
- [ ] Optimize tree shaking in utils
- [ ] Convert more components to Server Components
- [ ] Add Suspense boundaries
- [ ] Implement proper prefetching

### Before v2.0.0
- [ ] Setup Service Worker caching
- [ ] Implement streaming SSR
- [ ] Add Edge runtime where beneficial
- [ ] Database query optimization

---

## 📊 Measurement Tools

1. **Lighthouse** — Run `pnpm build && pnpm start`, then Lighthouse in DevTools
2. **Bundle Analyzer** — `ANALYZE=true pnpm build`
3. **React DevTools** — Profiler tab for render performance
4. **Network Tab** — Waterfall analysis
5. **Vercel Analytics** — Real user metrics

---

*Last updated: 2026-03-12*
