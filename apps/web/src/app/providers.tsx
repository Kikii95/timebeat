"use client";

import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {/* Theme, Toast, and other providers will be added here */}
      {children}
    </>
  );
}
