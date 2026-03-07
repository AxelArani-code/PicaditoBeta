"use client";

import Link from "next/link";
import { Bell, ExternalLink, Target } from "lucide-react";
import type { Profile } from "@/types";

interface Props {
    profile: Profile | null;
    unreadCount: number;
}

export function DashboardHeader({ profile, unreadCount }: Props) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Target className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">Pica<span className="text-primary">dito</span></span>
            </div>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
                {/* Ver perfil público */}
                {profile?.username && (
                    <Link
                        href={`/jugadores/${profile.username}`}
                        target="_blank"
                        className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:flex"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver perfil
                    </Link>
                )}

                {/* Notificaciones */}
                <Link
                    href="/dashboard/notificaciones"
                    className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {profile?.avatar_url
                        ? <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
                        : (profile?.full_name ?? profile?.username ?? "U").charAt(0).toUpperCase()
                    }
                </div>
            </div>
        </header>
    );
}
