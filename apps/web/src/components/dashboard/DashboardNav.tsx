"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Building2, CalendarCheck, Trophy, Users, User, BarChart3, LogOut, Target, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import { clearAuthSession } from "@/lib/auth/session";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/dashboard/venues", label: "Mis canchas", icon: Building2, roles: ["venue_owner", "admin"] },
    { href: "/dashboard/reservas", label: "Reservas", icon: CalendarCheck },
    { href: "/dashboard/partidos", label: "Partidos", icon: Trophy },
    { href: "/dashboard/equipos", label: "Equipos", icon: Users },
    { href: "/dashboard/ranking", label: "Ranking", icon: BarChart3 },
    { href: "/dashboard/perfil", label: "Mi perfil", icon: User },
];

interface Props {
    profile: Profile | null;
}

export function DashboardNav({ profile }: Props) {
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
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#3d4a3d]/40 bg-[#161d16]/95 shadow-[4px_0_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:flex">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-[#3d4a3d]/40 px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4be176] text-[#003915]">
                    <Target className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-bold leading-none text-[#dce5d9]">
                        Pica<span className="text-[#4be176]">dito</span>
                    </p>
                    {profile?.full_name && (
                        <p className="mt-0.5 text-[10px] text-[#bccbb9]/70">{profile.full_name}</p>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 p-3">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                active
                                    ? "border-r-[3px] border-[#4be176] bg-[#4be176]/10 text-[#4be176]"
                                    : "text-[#bccbb9] hover:translate-x-0.5 hover:bg-[#2f372e]/60 hover:text-[#dce5d9]"
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
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#21c45d] px-3 py-2">
                    <Activity className="h-4 w-4 text-[#004a1d]" />
                    <span className="text-xs font-bold text-[#004a1d]">System Health</span>
                </div>
                <Link
                    href="/"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#bccbb9] transition-all hover:bg-[#4be176]/10 hover:text-[#4be176]"
                >
                    <Home className="h-4 w-4" />
                    Volver a Inicio
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#bccbb9] transition-all hover:bg-[#ffb4ab]/10 hover:text-[#ffb4ab]"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
