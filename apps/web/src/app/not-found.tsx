import Link from "next/link";
import { Button } from "@timebeat/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-8xl font-bold text-[var(--color-primary-500)]">404</div>
        <h1 className="mb-2 text-2xl font-semibold">Page Not Found</h1>
        <p className="mb-6 text-[var(--color-text-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
