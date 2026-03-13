import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-[var(--color-primary-500)]">Time</span>
            <span>beat</span>
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Track your time. Boost your productivity.
          </p>
        </div>

        {/* Hero */}
        <div className="space-y-4 py-8">
          <div className="timer-display text-6xl font-light text-[var(--color-text-muted)]">
            00:00:00
          </div>
          <p className="text-sm text-[var(--color-text-subtle)]">
            Start tracking now
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-500)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-neutral-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 pt-8 text-center text-sm">
          <FeatureItem icon="⏱️" label="Track Time" />
          <FeatureItem icon="📊" label="Analytics" />
          <FeatureItem icon="🔄" label="Sync" />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-[var(--color-text-subtle)]">
        <p>Cross-platform • Offline-first • Open source</p>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="space-y-1">
      <span className="text-2xl">{icon}</span>
      <p className="text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
