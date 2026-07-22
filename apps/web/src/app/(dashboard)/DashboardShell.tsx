"use client";

import { useState, useEffect } from "react";
import { DashboardNav }    from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getAccessToken }  from "@/lib/auth/session";

// ─── Tipos del perfil resuelto ────────────────────────────────────────────────

export interface OwnerProfile {
  user: { id: string; email: string | null };
  profile: {
    fullName:  string | null;
    username:  string | null;
    avatarUrl: string | null;
    role:      string;
    city:      string | null;
  } | null;
  venue: { id: string; name: string; city: string | null } | null;
}

// ─── Layout shell (client) ────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownerData,  setOwnerData]  = useState<OwnerProfile | null>(null);

  // Al montar: resuelve el perfil real del dueño autenticado
  useEffect(() => {
    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    fetch("/api/owner/profile", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OwnerProfile | null) => {
        if (data) setOwnerData(data);
      })
      .catch(() => { /* fallo silencioso — la nav muestra placeholders */ });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1118]">
      <DashboardNav
        ownerData={ownerData}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          ownerData={ownerData}
          unreadCount={0}
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
