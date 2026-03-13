import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      colorVariant: {
        default: 'text-[var(--color-primary-500)]',
        muted: 'text-[var(--color-text-muted)]',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      colorVariant: 'default',
    },
  }
);

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, colorVariant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(spinnerVariants({ size, colorVariant, className }))}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export { spinnerVariants };
