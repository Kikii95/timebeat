import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Timebeat account",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Start tracking your time for free
        </p>
      </div>

      {/* Form */}
      <SignupForm />

      {/* Footer */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]"
        >
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-[var(--color-text-subtle)]">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:no-underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:no-underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
