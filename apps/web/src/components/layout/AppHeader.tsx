"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6">
      {/* Timer mini display (placeholder) */}
      <div className="flex items-center gap-3">
        <div className="timer-display text-lg text-[var(--color-text-muted)]">
          00:00:00
        </div>
        <span className="text-sm text-[var(--color-text-subtle)]">
          No active session
        </span>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
