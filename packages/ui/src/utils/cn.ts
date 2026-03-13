import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names with conditional support
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
