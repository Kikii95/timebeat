import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-[var(--color-surface-elevated)] text-sm transition-colors placeholder:text-[var(--color-text-subtle)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-border)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]",
        error:
          "border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-1 focus:ring-[var(--color-danger-500)]",
      },
      inputSize: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({
            variant: error ? "error" : variant,
            inputSize,
            className,
          }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { inputVariants };
