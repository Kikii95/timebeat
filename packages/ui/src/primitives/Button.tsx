import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] focus-visible:ring-[var(--color-primary-500)]',
        secondary:
          'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-neutral-100)] focus-visible:ring-[var(--color-primary-500)]',
        danger:
          'bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-600)] focus-visible:ring-[var(--color-danger-500)]',
        warning:
          'bg-[var(--color-warning-500)] text-white hover:bg-[var(--color-warning-600)] focus-visible:ring-[var(--color-warning-500)]',
        ghost:
          'hover:bg-[var(--color-neutral-100)] focus-visible:ring-[var(--color-primary-500)]',
        link: 'text-[var(--color-primary-500)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
