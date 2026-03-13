import { Spinner } from "@timebeat/ui";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
