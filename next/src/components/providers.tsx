"use client";

import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/components/auth-modals";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>{children}</AuthModalProvider>
    </SessionProvider>
  );
}
