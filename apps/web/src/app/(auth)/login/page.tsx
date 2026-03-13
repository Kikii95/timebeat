import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Timebeat account",
};

function LoginFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-[var(--color-neutral-100)] rounded-lg" />
      <div className="h-10 bg-[var(--color-neutral-100)] rounded-lg" />
      <div className="h-10 bg-[var(--color-neutral-100)] rounded-lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Sign in to continue tracking your time
        </p>
      </div>

      {/* Form */}
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>

      {/* Footer */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
