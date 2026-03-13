/**
 * @package @timebeat/hooks
 * Shared React hooks for Timebeat
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useTimerStore } from "@timebeat/core";
import { TimerState } from "@timebeat/types";
import { TIMER_CONSTANTS } from "@timebeat/constants";

/**
 * Hook to manage timer tick interval
 * Only ticks when timer is in RUNNING or BREAK state
 */
export function useTimerTick() {
  const tick = useTimerStore((state) => state.tick);
  const timerState = useTimerStore((state) => state.state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only tick when running or on break (not when IDLE or PAUSED)
    if (timerState === TimerState.RUNNING || timerState === TimerState.BREAK) {
      intervalRef.current = setInterval(tick, TIMER_CONSTANTS.TICK_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState, tick]);
}

/**
 * Hook for localStorage with SSR support
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue, key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(readValue()) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, readValue],
  );

  return [readValue(), setValue] as const;
}

/**
 * Hook for window visibility changes
 */
export function useVisibilityChange(
  onVisible?: () => void,
  onHidden?: () => void,
) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onHidden?.();
      } else {
        onVisible?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onVisible, onHidden]);
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {},
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const ctrlMatch = modifiers.ctrl ? event.ctrlKey || event.metaKey : true;
      const shiftMatch = modifiers.shift ? event.shiftKey : true;
      const altMatch = modifiers.alt ? event.altKey : true;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, modifiers]);
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
