# 🚀 Timebeat — Deployment Guide

> Production deployment for Web, Desktop, and Mobile

---

## 📋 Pre-Deployment Checklist

### Environment Variables

```bash
# Required for all platforms
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side only

# Optional
NEXT_PUBLIC_APP_URL=https://timebeat.app
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Database Setup

```bash
# 1. Create Supabase project at supabase.com
# 2. Get credentials from Settings > API

# 3. Generate Prisma client
pnpm db:generate

# 4. Push schema to Supabase
pnpm db:push

# 5. Apply RLS policies (see below)
```

### RLS Policies (Required)

```sql
-- Run in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- Tasks (via project ownership)
CREATE POLICY "Users can CRUD own tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Sessions
CREATE POLICY "Users can CRUD own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can CRUD own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🌐 Web Deployment (Vercel)

### Option A: GitHub Integration (Recommended)

1. **Connect Repository**
   ```
   vercel.com/new → Import Git Repository
   Select: kiki/timebeat
   ```

2. **Configure Project**
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL = xxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx
   SUPABASE_SERVICE_ROLE_KEY = xxx
   ```

4. **Deploy**
   - Push to `main` → Auto deploy to production
   - Push to `dev` → Auto deploy to preview

### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from apps/web/)
cd apps/web
vercel

# Production deploy
vercel --prod
```

### Domain Setup

```bash
# Add custom domain
vercel domains add timebeat.app

# DNS Records (at your registrar)
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

### Performance Headers

```typescript
// apps/web/next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};
```

---

## 🖥️ Desktop Deployment (Tauri)

### Prerequisites

```bash
# Windows
# Install: Visual Studio Build Tools, WebView2, Rust

# macOS
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Linux
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget
```

### Build Process

```bash
# 1. Export static web app
cd apps/web
pnpm build
pnpm export  # Generates out/ folder

# 2. Build Tauri app
cd ../desktop
pnpm tauri build
```

### Output Locations

| Platform | Output |
|----------|--------|
| Windows | `src-tauri/target/release/bundle/msi/Timebeat_1.0.0_x64_en-US.msi` |
| macOS | `src-tauri/target/release/bundle/dmg/Timebeat_1.0.0_x64.dmg` |
| Linux | `src-tauri/target/release/bundle/appimage/Timebeat_1.0.0_amd64.AppImage` |

### Code Signing

#### Windows

```toml
# src-tauri/tauri.conf.json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

#### macOS

```bash
# Sign with Developer ID
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "Timebeat.app"

# Notarize
xcrun notarytool submit Timebeat.dmg \
  --apple-id "you@email.com" \
  --password "@keychain:AC_PASSWORD" \
  --team-id "TEAM_ID" \
  --wait
```

### Auto-Update (Tauri Updater)

```json
// src-tauri/tauri.conf.json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://releases.timebeat.app/{{target}}/{{arch}}/{{current_version}}"
      ],
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6..."
    }
  }
}
```

**Update Server** (simple JSON):
```json
// https://releases.timebeat.app/windows/x86_64/1.0.0
{
  "version": "1.0.1",
  "url": "https://releases.timebeat.app/Timebeat_1.0.1_x64_en-US.msi",
  "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
  "notes": "Bug fixes and performance improvements"
}
```

### GitHub Releases (Recommended)

```yaml
# .github/workflows/release-desktop.yml
name: Release Desktop

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install pnpm
        run: npm i -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build web
        run: pnpm --filter @timebeat/web build && pnpm --filter @timebeat/web export

      - name: Build Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          projectPath: apps/desktop
          tagName: v__VERSION__
          releaseName: 'Timebeat v__VERSION__'
          releaseBody: 'See CHANGELOG for details.'
          releaseDraft: true
```

---

## 📱 Mobile Deployment (Future)

### iOS (App Store)

```bash
# Build
cd apps/mobile
npx cap build ios

# Open in Xcode
npx cap open ios

# Archive and upload via Xcode Organizer
```

### Android (Play Store)

```bash
# Build signed APK
cd apps/mobile/android
./gradlew assembleRelease

# Or AAB for Play Store
./gradlew bundleRelease
```

---

## 🔒 Security Checklist

- [ ] All env vars set (not hardcoded)
- [ ] RLS policies applied to all tables
- [ ] CORS configured for production domain
- [ ] SSL/TLS enabled (automatic on Vercel)
- [ ] Rate limiting on API routes
- [ ] CSP headers configured
- [ ] No secrets in client bundle

---

## 📊 Monitoring

### Vercel Analytics

```typescript
// Already in layout.tsx
import { Analytics } from '@vercel/analytics/react';
```

### Sentry (Optional)

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Uptime Monitoring

- **BetterUptime** — Free tier available
- **Checkly** — API monitoring
- **Vercel** — Built-in status page

---

## 🔄 CI/CD Summary

| Event | Action |
|-------|--------|
| Push to `main` | Deploy web to production |
| Push to `dev` | Deploy web to preview |
| Tag `v*` | Build & release desktop apps |
| PR | Run tests + type check |

---

*Last updated: 2026-03-12*
