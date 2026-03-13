"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@timebeat/ui";

/**
 * Client-side auth callback handler for static export (desktop app)
 * In static export mode, API routes don't work, so we handle
 * the OAuth code exchange entirely client-side.
 */
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const redirectTo = searchParams.get("redirect") || "/dashboard";

      if (!code) {
        setError("No authorization code provided");
        setTimeout(() => router.push("/login?error=no_code"), 2000);
        return;
      }

      try {
        const supabase = createClient();

        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Auth exchange error:", exchangeError);
          setError(exchangeError.message);
          setTimeout(() => router.push("/login?error=auth_callback_error"), 2000);
          return;
        }

        // Success - redirect to dashboard or specified page
        router.push(redirectTo);
      } catch (err) {
        console.error("Callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => router.push("/login?error=auth_callback_error"), 2000);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-xl font-semibold text-[var(--color-danger-600)]">
              Authentication Error
            </h1>
            <p className="text-[var(--color-text-muted)]">{error}</p>
            <p className="text-sm text-[var(--color-text-subtle)]">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <h1 className="text-xl font-semibold">Completing sign in...</h1>
            <p className="text-[var(--color-text-muted)]">
              Please wait while we set up your session.
            </p>
            <div className="flex justify-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
