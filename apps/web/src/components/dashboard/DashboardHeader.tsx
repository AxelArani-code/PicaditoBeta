"use client";

import Link from "next/link";
import { Bell, ExternalLink, LogOut, Target } from "lucide-react";
import type { Profile } from "@/types";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session";
import { MobileNavDrawer } from "@/components/dashboard/MobileNavDrawer";

interface Props {
    profile: Profile | null;
    unreadCount: number;
}

export function DashboardHeader({ profile, unreadCount }: Props) {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
        } finally {
            clearAuthSession();
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-[#3d4a3d]/40 bg-[#0e150e]/85 px-4 backdrop-blur-2xl sm:px-6">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-2 lg:hidden">
                <MobileNavDrawer profile={profile} />
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4be176] text-[#003915]">
                        <Target className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-bold text-[#dce5d9]">
                        Pica<span className="text-[#4be176]">dito</span>
                    </span>
                </div>
            </div>

            {/* Desktop left — page context */}
            <div className="hidden lg:block">
                {profile?.full_name ? (
                    <p className="text-sm font-semibold text-[#dce5d9]">{profile.full_name}</p>
                ) : (
                    <p className="text-sm text-[#bccbb9]/70">Dashboard</p>
                )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
                {/* Ver perfil público */}
                {profile?.username && (
                    <Link
                        href={`/jugadores/${profile.username}`}
                        target="_blank"
                        className="hidden items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-[#bccbb9] transition hover:bg-[#2f372e]/60 hover:text-[#dce5d9] sm:flex"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver perfil
                    </Link>
                )}

                {/* Notificaciones */}
                <Link
                    href="/dashboard/notificaciones"
                    className="relative rounded-xl p-2 text-[#bccbb9] transition hover:bg-[#2f372e]/60 hover:text-[#dce5d9]"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4be176] text-[10px] font-bold text-[#003915]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Link>

                <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl p-2 text-[#bccbb9] transition hover:bg-[#ffb4ab]/10 hover:text-[#ffb4ab]"
                    aria-label="Cerrar sesión"
                >
                    <LogOut className="h-5 w-5" />
                </button>

                {/* Avatar */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4be176]/25 bg-[#4be176]/15 text-sm font-bold text-[#4be176]"
                >
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
                    ) : (
                        (profile?.full_name ?? profile?.username ?? "U").charAt(0).toUpperCase()
                    )}
                </div>
            </div>
        </header>
    );
}
