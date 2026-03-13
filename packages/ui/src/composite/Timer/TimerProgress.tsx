import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const progressVariants = cva('', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
    variant: {
      linear: 'w-full rounded-full bg-[var(--color-neutral-200)]',
      circular: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'linear',
  },
});

export interface TimerProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  elapsed: number;
  planned: number;
  showLabel?: boolean;
}

export const TimerProgress = forwardRef<HTMLDivElement, TimerProgressProps>(
  (
    {
      className,
      size,
      variant = 'linear',
      elapsed,
      planned,
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const progress = Math.min(100, (elapsed / planned) * 100);
    const remaining = Math.max(0, planned - elapsed);
    const isOvertime = elapsed > planned;

    if (variant === 'circular') {
      const circumference = 2 * Math.PI * 45;
      const strokeDashoffset = circumference - (progress / 100) * circumference;

      return (
        <div
          ref={ref}
          className={cn('relative inline-flex items-center justify-center', className)}
          {...props}
        >
          <svg className="h-24 w-24 -rotate-90 transform">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="var(--color-neutral-200)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke={
                isOvertime
                  ? 'var(--color-danger-500)'
                  : 'var(--color-primary-500)'
              }
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          {showLabel && (
            <div className="absolute text-center">
              <span className="text-lg font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        <div className={cn(progressVariants({ size, variant }))}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-linear',
              isOvertime
                ? 'bg-[var(--color-danger-500)]'
                : 'bg-[var(--color-primary-500)]'
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>{Math.round(progress)}%</span>
            <span>
              {isOvertime ? `+${Math.floor((elapsed - planned) / 60)}m overtime` : `${Math.ceil(remaining / 60)}m left`}
            </span>
          </div>
        )}
      </div>
    );
  }
);

TimerProgress.displayName = 'TimerProgress';

export { progressVariants };
