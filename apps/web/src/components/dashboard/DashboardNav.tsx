"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Building2, CalendarCheck, Trophy, Users, User, BarChart3, LogOut, Target,
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
                headers: {
                    "Content-Type": "application/json",
                },
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
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Target className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">Pica<span className="text-primary">dito</span></span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-border p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
