"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    Building2,
    CalendarDays,
    CalendarX2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Grid2X2,
    LogOut,
    Menu,
    MessageSquareWarning,
    Settings,
    Users,
    X,
} from "lucide-react";
import type { OwnerProfile } from "@/app/(dashboard)/DashboardShell";
import { clearAuthSession } from "@/lib/auth/session";
import { useState, useEffect } from "react";

// ─── Navigation config ────────────────────────────────────────────────────────

const MANAGEMENT_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: Grid2X2 },
    { href: "/dashboard/venues", label: "Mis canchas", icon: Building2 },
    { href: "/dashboard/reservas", label: "Turnos", icon: CalendarDays },
    { href: "/dashboard/calendario", label: "Calendario", icon: CalendarDays },
    { href: "/dashboard/cierres", label: "Cierres de Cancha", icon: CalendarX2 },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/pagos", label: "Pagos / Señas", icon: CreditCard },
    { href: "/dashboard/reclamos", label: "Reclamos", icon: MessageSquareWarning },
    { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

const ACCOUNT_ITEMS = [
    { href: "/dashboard/mi-complejo", label: "Mi complejo", icon: Building2 },
    { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActivePath(pathname: string, href: string): boolean {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavItemProps {
    href: string;
    label: string;
    icon: React.ElementType;
    collapsed: boolean;
    active: boolean;
    onClick?: () => void;
}

function NavItem({ href, label, icon: Icon, collapsed, active, onClick }: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition-all ${
                active
                    ? "bg-[#0b2230] text-[#56d6ff]"
                    : "text-[#a6b8c4] hover:bg-[#0b2230]/70 hover:text-[#dbe8ef]"
            } ${collapsed ? "justify-center px-2" : ""}`}
        >
            {active && (
                <span className="absolute -left-3 top-1/2 h-9 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1cff87]" />
            )}
            <Icon
                className={`shrink-0 ${collapsed ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]"} ${
                    active ? "text-[#28d7ff]" : "text-[#8ca3b2]"
                }`}
                strokeWidth={1.7}
            />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
    return (
        <p
            className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#577080] transition-opacity ${
                collapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : ""
            }`}
        >
            {label}
        </p>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
    ownerData?: OwnerProfile | null;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function DashboardNav({ ownerData, mobileOpen = false, onMobileClose }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        onMobileClose?.();
    }, [pathname]);

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

    const navContent = (
        <div className="flex h-full flex-col">
            {/* Logo + Toggle */}
            <div className={`flex items-center border-b border-[#1b3442] px-4 py-5 ${collapsed ? "justify-center" : "justify-between"}`}>
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center" aria-label="Picadito dashboard">
                        <img
                            src="/logo-picadito.png"
                            alt="Picadito"
                            className="h-8 w-auto object-contain"
                        />
                    </Link>
                )}

                {/* Desktop collapse toggle */}
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
                    className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-[#234253] bg-[#0a2231] text-[#7f96a6] transition hover:border-[#2c5368] hover:text-[#d8e6ee]"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                    ) : (
                        <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
                    )}
                </button>

                {/* Mobile close button */}
                <button
                    type="button"
                    onClick={onMobileClose}
                    aria-label="Cerrar menú"
                    className="flex lg:hidden ml-auto h-9 w-9 items-center justify-center rounded-xl border border-[#234253] bg-[#0a2231] text-[#7f96a6] transition hover:border-[#2c5368] hover:text-[#d8e6ee]"
                >
                    <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
            </div>

            {/* Venue card */}
            {!collapsed && (
                <div className="px-4 pt-4">
                    <Link
                        href="/dashboard/mi-complejo"
                        className="flex h-[80px] items-center gap-4 rounded-2xl border border-[#24465a] bg-[#0b2637] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-[#2d5a73] hover:bg-[#0d2b3e]"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0c3043] text-[#45cfff]">
                            <Building2 className="h-4 w-4" strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold leading-4 text-[#f1f8fb]">
                                {ownerData?.venue?.name ?? "Mi Complejo"}
                            </span>
                            <span className="mt-1 block truncate text-[11px] leading-4 text-[#70889a]">
                                {ownerData?.venue?.city
                                    ? ownerData.venue.city
                                    : ownerData?.profile?.city
                                    ? ownerData.profile.city
                                    : "— ciudad —"}
                            </span>
                        </span>
                    </Link>
                </div>
            )}

            {/* Nav sections */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-4">
                {/* GESTIÓN */}
                <div className={`border-t border-[#142c3a] px-3 pt-5 ${collapsed ? "border-0 pt-2" : ""}`}>
                    <SectionLabel label="Gestión" collapsed={collapsed} />
                    <div className="space-y-1">
                        {MANAGEMENT_ITEMS.map(({ href, label, icon }) => (
                            <NavItem
                                key={href}
                                href={href}
                                label={label}
                                icon={icon}
                                collapsed={collapsed}
                                active={isActivePath(pathname, href)}
                                onClick={onMobileClose}
                            />
                        ))}
                    </div>
                </div>

                {/* CUENTA */}
                <div className={`mt-6 border-t border-[#142c3a] px-3 pt-5 ${collapsed ? "mt-4" : ""}`}>
                    <SectionLabel label="Cuenta" collapsed={collapsed} />
                    <div className="space-y-1">
                        {ACCOUNT_ITEMS.map(({ href, label, icon }) => (
                            <NavItem
                                key={href}
                                href={href}
                                label={label}
                                icon={icon}
                                collapsed={collapsed}
                                active={isActivePath(pathname, href)}
                                onClick={onMobileClose}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Sign out */}
            <div className="border-t border-[#1b3442] px-4 py-5">
                <button
                    type="button"
                    onClick={handleSignOut}
                    title={collapsed ? "Cerrar sesión" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl py-1.5 text-[13px] font-semibold text-[#a8b9c5] transition hover:text-[#eef7fb] ${
                        collapsed ? "justify-center" : "px-0"
                    }`}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1c3342] bg-[#050d13] text-[#f4f7f8]">
                        <LogOut className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    {!collapsed && "Cerrar sesión"}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* ── Desktop sidebar ───────────────────────────────────────────── */}
            <aside
                className={`hidden lg:flex h-screen shrink-0 flex-col border-r border-[#1b3442] bg-[#071b28] text-[#9eb2bf] shadow-[10px_0_30px_rgba(0,0,0,0.22)] transition-[width] duration-300 ease-in-out overflow-hidden ${
                    collapsed ? "w-[68px]" : "w-[272px]"
                }`}
            >
                {navContent}
            </aside>

            {/* ── Mobile overlay + drawer ───────────────────────────────────── */}
            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[272px] flex-col border-r border-[#1b3442] bg-[#071b28] text-[#9eb2bf] shadow-[10px_0_30px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-in-out lg:hidden ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                } flex`}
            >
                {navContent}
            </aside>
        </>
    );
}

// ─── Mobile hamburger button (to be placed in the header) ─────────────────────

interface HamburgerProps {
    onClick: () => void;
}

export function MobileMenuButton({ onClick }: HamburgerProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#234253] bg-[#0a2231] text-[#7f96a6] transition hover:border-[#2c5368] hover:text-[#d8e6ee] lg:hidden"
        >
            <Menu className="h-4 w-4" strokeWidth={1.8} />
        </button>
    );
}
