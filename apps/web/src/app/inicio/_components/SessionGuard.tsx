"use client";

import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth/session";

/**
 * Mounts invisible auth session guard.
 * Extracted from page.tsx to allow that file to be a Server Component.
 */
export default function SessionGuard() {
  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated()) return;

    window.history.replaceState({ picaditoSessionGuard: true }, "", "/inicio");
    window.history.pushState({ picaditoSessionGuard: true }, "", "/inicio");

    const keepUserInActiveSession = () => {
      if (isAuthenticated()) {
        window.history.pushState({ picaditoSessionGuard: true }, "", "/inicio");
      }
    };

    window.addEventListener("popstate", keepUserInActiveSession);
    return () => window.removeEventListener("popstate", keepUserInActiveSession);
  }, []);

  return null;
}
