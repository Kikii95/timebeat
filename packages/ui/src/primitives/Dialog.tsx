"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cn } from "../utils/cn";

export interface DialogProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  "title"
> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  (
    { className, open, onClose, title, description, children, ...props },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const resolvedRef =
      (ref as React.RefObject<HTMLDialogElement>) || dialogRef;

    useEffect(() => {
      const dialog = resolvedRef.current;
      if (!dialog) return;

      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [open, resolvedRef]);

    useEffect(() => {
      const dialog = resolvedRef.current;
      if (!dialog) return;

      const handleClose = () => onClose();
      dialog.addEventListener("close", handleClose);
      return () => dialog.removeEventListener("close", handleClose);
    }, [onClose, resolvedRef]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = resolvedRef.current;
      if (dialog && e.target === dialog) {
        onClose();
      }
    };

    return (
      <dialog
        ref={resolvedRef}
        className={cn(
          "fixed inset-0 m-auto p-0 rounded-xl shadow-xl",
          "bg-[var(--color-surface-elevated)] text-[var(--color-text)]",
          "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
          "w-full max-w-md",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "[&:not([open])]:hidden",
          className,
        )}
        onClick={handleBackdropClick}
        {...props}
      >
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </dialog>
    );
  },
);

Dialog.displayName = "Dialog";

// === DIALOG CLOSE BUTTON ===

export interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {
  onClose: () => void;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, onClose, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClose}
        className={cn(
          "absolute right-4 top-4 rounded-full p-1",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          "hover:bg-[var(--color-neutral-100)] transition-colors",
          className,
        )}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span className="sr-only">Close</span>
      </button>
    );
  },
);

DialogClose.displayName = "DialogClose";

// === DIALOG FOOTER ===

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-6 flex items-center justify-end gap-3", className)}
        {...props}
      />
    );
  },
);

DialogFooter.displayName = "DialogFooter";
