import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-neutral-100)] text-[var(--color-text)]',
        primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
        secondary: 'bg-[var(--color-neutral-100)] text-[var(--color-text-muted)]',
        success: 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]',
        warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]',
        danger: 'bg-[var(--color-danger-100)] text-[var(--color-danger-700)]',
        outline:
          'border border-[var(--color-border)] bg-transparent text-[var(--color-text)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { badgeVariants };
