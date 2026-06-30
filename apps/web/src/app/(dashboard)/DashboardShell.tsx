"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// ─── Layout shell (client) ────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a1118]">
            <DashboardNav
                profile={null}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader
                    profile={null}
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
