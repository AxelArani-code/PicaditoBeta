"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Menu, X, Home, Building2, CalendarCheck, Trophy,
    Users, User, BarChart3, LogOut, Target, Activity,
} from "lucide-react";
import type { Profile } from "@/types";
import { clearAuthSession } from "@/lib/auth/session";

const NAV_ITEMS = [
    { href: "/dashboard",          label: "Inicio",      icon: Home },
    { href: "/dashboard/venues",   label: "Mis canchas", icon: Building2, roles: ["venue_owner", "admin"] },
    { href: "/dashboard/reservas", label: "Reservas",    icon: CalendarCheck },
    { href: "/dashboard/partidos", label: "Partidos",    icon: Trophy },
    { href: "/dashboard/equipos",  label: "Equipos",     icon: Users },
    { href: "/dashboard/ranking",  label: "Ranking",     icon: BarChart3 },
    { href: "/dashboard/perfil",   label: "Mi perfil",   icon: User },
];

interface Props {
    profile: Profile | null;
}

export function MobileNavDrawer({ profile }: Props) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
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

    const navItems = NAV_ITEMS.filter(
        (item) => !item.roles || (profile?.role && item.roles.includes(profile.role))
    );

    return (
        <>
            {/* Hamburger trigger — only visible on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="rounded-xl p-2 text-[#bccbb9] transition hover:bg-[#2f372e]/60 hover:text-[#dce5d9] lg:hidden"
                aria-label="Abrir menú"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#3d4a3d]/40 bg-[#0e150e]/95 backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-[#3d4a3d]/40 px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4be176] text-[#003915]">
                            <Target className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-[#dce5d9]">
                            Pica<span className="text-[#4be176]">dito</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-xl p-2 text-[#bccbb9] transition hover:bg-[#2f372e]/60"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                    active
                                        ? "border-r-[3px] border-[#4be176] bg-[#4be176]/10 text-[#4be176]"
                                        : "text-[#bccbb9] hover:bg-[#2f372e]/60 hover:text-[#dce5d9]"
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="space-y-1 border-t border-[#3d4a3d]/40 p-3">
                    <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#21c45d] px-3 py-2">
                        <Activity className="h-4 w-4 text-[#004a1d]" />
                        <span className="text-xs font-bold text-[#004a1d]">System Health</span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#bccbb9] transition-all hover:bg-[#ffb4ab]/10 hover:text-[#ffb4ab]"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
