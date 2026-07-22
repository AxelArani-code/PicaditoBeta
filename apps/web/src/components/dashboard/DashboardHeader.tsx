"use client";

import type { OwnerProfile } from "@/app/(dashboard)/DashboardShell";
import { MobileMenuButton } from "@/components/dashboard/DashboardNav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera las iniciales del nombre para el avatar */
function getInitials(fullName: string | null | undefined, email: string | null | undefined): string {
    if (fullName) {
        return fullName
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase() ?? "")
            .join("");
    }
    return email?.[0]?.toUpperCase() ?? "?";
}

/** Etiqueta de rol en español */
function getRoleLabel(role: string | null | undefined): string {
    switch (role) {
        case "venue_owner": return "Dueño de complejo";
        case "admin":       return "Administrador";
        case "player":      return "Jugador";
        default:            return "Usuario";
    }
}

/** Fecha dinámica en formato legible */
function getTodayLabel(): string {
    return new Date().toLocaleDateString("es-AR", {
        weekday: "long",
        day:     "numeric",
        month:   "long",
    });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    ownerData:         OwnerProfile | null;
    unreadCount:       number;
    onMobileMenuToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardHeader({ ownerData, unreadCount, onMobileMenuToggle }: Props) {
    const displayName = ownerData?.profile?.fullName
        ?? ownerData?.profile?.username
        ?? ownerData?.user?.email
        ?? "—";

    const roleLabel   = getRoleLabel(ownerData?.profile?.role);
    const initials    = getInitials(ownerData?.profile?.fullName, ownerData?.user?.email);
    const todayLabel  = getTodayLabel();

    return (
        <header className="flex h-16 items-center justify-between border-b border-[#1d3b52]/50 bg-[#07111d] px-4 sm:px-6">
            {/* Left: hamburger (mobile) + fecha dinámica */}
            <div className="flex items-center gap-3">
                <MobileMenuButton onClick={onMobileMenuToggle} />

                <span className="text-sm text-[#9fb3c5] capitalize">
                    Hoy,{" "}
                    <span className="font-bold text-white">{todayLabel}</span>
                </span>
            </div>

            {/* Right: nombre real + rol + avatar */}
            <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                    <p className="text-sm font-bold leading-tight text-white">
                        {displayName}
                    </p>
                    <p className="text-xs text-[#7890a3]">{roleLabel}</p>
                </div>

                {/* Avatar con iniciales */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#244257] bg-[#102a40] text-sm font-bold text-[#d7e8f2]">
                    {initials}
                </div>
            </div>
        </header>
    );
}
