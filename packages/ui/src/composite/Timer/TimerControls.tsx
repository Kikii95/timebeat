import { forwardRef, type HTMLAttributes } from 'react';
import { TimerState } from '@timebeat/types';
import { cn } from '../../utils/cn';
import { Button } from '../../primitives/Button';

export interface TimerControlsProps extends HTMLAttributes<HTMLDivElement> {
  state: TimerState;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onStartBreak?: () => void;
  onEndBreak?: () => void;
  disabled?: boolean;
  showBreakButton?: boolean;
}

export const TimerControls = forwardRef<HTMLDivElement, TimerControlsProps>(
  (
    {
      className,
      state,
      onStart,
      onPause,
      onResume,
      onStop,
      onStartBreak,
      onEndBreak,
      disabled = false,
      showBreakButton = true,
      ...props
    },
    ref
  ) => {
    const isRunning = state === TimerState.RUNNING;
    const isPaused = state === TimerState.PAUSED;
    const isIdle = state === TimerState.IDLE;
    const isOnBreak = state === TimerState.BREAK;

    return (
      <div
        ref={ref}
        className={cn('flex justify-center gap-3', className)}
        {...props}
      >
        {isIdle && (
          <Button
            onClick={onStart}
            disabled={disabled}
            variant="primary"
            size="lg"
          >
            ▶️ Start
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              onClick={onPause}
              disabled={disabled}
              variant="secondary"
            >
              ⏸️ Pause
            </Button>
            {showBreakButton && (
              <Button
                onClick={onStartBreak}
                disabled={disabled}
                variant="warning"
              >
                ☕ Break
              </Button>
            )}
            <Button
              onClick={onStop}
              disabled={disabled}
              variant="danger"
            >
              ⏹️ Stop
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              onClick={onResume}
              disabled={disabled}
              variant="primary"
              size="lg"
            >
              ▶️ Resume
            </Button>
            <Button
              onClick={onStop}
              disabled={disabled}
              variant="danger"
            >
              ⏹️ Stop
            </Button>
          </>
        )}

        {isOnBreak && (
          <Button
            onClick={onEndBreak}
            disabled={disabled}
            variant="primary"
            size="lg"
          >
            ▶️ End Break
          </Button>
        )}
      </div>
    );
  }
);

TimerControls.displayName = 'TimerControls';
