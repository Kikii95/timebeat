"use client";

import { useEffect } from "react";
import { Button } from "@timebeat/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">💥</div>
        <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mb-6 text-[var(--color-text-muted)]">
          An unexpected error occurred. Don&apos;t worry, your timer data is safe.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-6 max-w-full overflow-auto rounded-lg bg-[var(--color-surface)] p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
