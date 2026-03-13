import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-lg bg-[var(--color-neutral-100)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
