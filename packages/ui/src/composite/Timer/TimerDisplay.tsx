import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TimerState, type Project, type Task } from '@timebeat/types';
import { formatTimer } from '@timebeat/utils';
import { cn } from '../../utils/cn';
import { Badge } from '../../primitives/Badge';

const timerDisplayVariants = cva('text-center', {
  variants: {
    variant: {
      full: 'space-y-4',
      compact: 'space-y-2',
      mini: 'flex items-center gap-2',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
});

const timeVariants = cva('font-light tracking-tight tabular-nums', {
  variants: {
    variant: {
      full: 'text-7xl',
      compact: 'text-4xl',
      mini: 'text-lg font-medium',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
});

export interface TimerDisplayProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timerDisplayVariants> {
  elapsed: number;
  planned?: number | null;
  state: TimerState;
  project?: Project | null;
  task?: Task | null;
  mode?: 'FREE' | 'TIMED';
  showProject?: boolean;
}

export const TimerDisplay = forwardRef<HTMLDivElement, TimerDisplayProps>(
  (
    {
      className,
      variant = 'full',
      elapsed,
      planned,
      state,
      project,
      task,
      mode = 'FREE',
      showProject = true,
      ...props
    },
    ref
  ) => {
    const isRunning = state === TimerState.RUNNING;
    const isPaused = state === TimerState.PAUSED;
    const isOnBreak = state === TimerState.BREAK;

    const displayTime =
      mode === 'TIMED' && planned ? Math.max(0, planned - elapsed) : elapsed;

    const statusLabel = isRunning
      ? 'Running'
      : isOnBreak
        ? 'On Break'
        : isPaused
          ? 'Paused'
          : 'Ready';

    const statusVariant = isRunning
      ? 'success'
      : isOnBreak
        ? 'warning'
        : isPaused
          ? 'secondary'
          : 'default';

    if (variant === 'mini') {
      return (
        <div
          ref={ref}
          className={cn(timerDisplayVariants({ variant }), className)}
          {...props}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isRunning || isOnBreak ? 'animate-pulse' : '',
              isRunning
                ? 'bg-[var(--color-accent-500)]'
                : isOnBreak
                  ? 'bg-[var(--color-warning-500)]'
                  : 'bg-[var(--color-neutral-400)]'
            )}
          />
          <span className={cn(timeVariants({ variant }))}>
            {formatTimer(displayTime)}
          </span>
          {showProject && project && (
            <span className="text-sm text-[var(--color-text-muted)]">
              {project.name}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(timerDisplayVariants({ variant }), className)}
        {...props}
      >
        {/* State indicator */}
        {variant === 'full' && (
          <div>
            <Badge variant={statusVariant} className="gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isRunning || isOnBreak ? 'animate-pulse' : '',
                  isRunning
                    ? 'bg-[var(--color-accent-500)]'
                    : isOnBreak
                      ? 'bg-[var(--color-warning-500)]'
                      : 'bg-[var(--color-neutral-400)]'
                )}
              />
              {statusLabel}
            </Badge>
          </div>
        )}

        {/* Time display */}
        <div className={cn(timeVariants({ variant }))}>
          {formatTimer(displayTime)}
        </div>

        {/* Mode info */}
        {mode === 'TIMED' && planned && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {formatTimer(elapsed)} / {formatTimer(planned)}
          </p>
        )}

        {/* Project/Task info */}
        {showProject && project && variant === 'full' && (
          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="font-medium">{project.name}</span>
            {task && <span> • {task.title}</span>}
          </div>
        )}
      </div>
    );
  }
);

TimerDisplay.displayName = 'TimerDisplay';

export { timerDisplayVariants };
