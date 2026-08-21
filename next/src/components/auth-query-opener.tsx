"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthModal } from "@/components/auth-modals";

export function AuthQueryOpener() {
  const params = useSearchParams();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (params.get("auth") === "login") openLogin();
  }, [params, openLogin]);

  return null;
}
