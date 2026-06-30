"use client";

import type { Profile } from "@/types";
import { MobileMenuButton } from "@/components/dashboard/DashboardNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    profile: Profile | null;
    unreadCount: number;
    onMobileMenuToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardHeader({ profile, unreadCount, onMobileMenuToggle }: Props) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-[#1d3b52]/50 bg-[#07111d] px-4 sm:px-6">
            {/* Left: hamburger (mobile) + date */}
            <div className="flex items-center gap-3">
                <MobileMenuButton onClick={onMobileMenuToggle} />

                <span className="text-sm text-[#9fb3c5]">
                    Hoy Es{" "}
                    <span className="font-bold text-white">Martes, 9 De Junio</span>
                </span>
            </div>

            {/* Right: user info + avatar */}
            <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                    <p className="text-sm font-bold leading-tight text-white">Carlos Méndez</p>
                    <p className="text-xs text-[#7890a3]">Administrador</p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#244257] bg-[#102a40] text-sm font-bold text-[#d7e8f2]">
                    CM
                </div>
            </div>
        </header>
    );
}
