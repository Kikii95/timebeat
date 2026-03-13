import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          <span className="text-[var(--color-primary-500)]">Time</span>
          <span>beat</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-6 py-4 text-center text-sm text-[var(--color-text-subtle)]">
        <p>© {new Date().getFullYear()} Timebeat. All rights reserved.</p>
      </footer>
    </div>
  );
}
