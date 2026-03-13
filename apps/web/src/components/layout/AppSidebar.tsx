"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Timer", href: "/timer", icon: "⏱️" },
  { name: "Projects", href: "/projects", icon: "📁" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
        <Link href="/dashboard" className="text-xl font-semibold">
          <span className="text-[var(--color-primary-500)]">Time</span>
          <span>beat</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text)]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="rounded-lg bg-[var(--color-neutral-100)] p-3 text-center text-xs text-[var(--color-text-muted)]">
          <p className="font-medium">Timebeat v0.1.0</p>
          <p>Made with ❤️</p>
        </div>
      </div>
    </aside>
  );
}
