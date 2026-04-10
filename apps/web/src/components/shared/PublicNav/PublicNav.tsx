"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Trophy,
    MapPin,
    Users,
    Mail,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Menu,
    CalendarDays,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuthSession } from "@/lib/auth/session";

// ─── Navigation config ────────────────────────────────────────────────────────

const EXPLORE_ITEMS = [
    { href: "/inicio",           label: "Inicio",        icon: MapPin },
    { href: "/torneos",          label: "Torneos",        icon: Trophy },
    { href: "/inicio/mis-reservas", label: "Mis Reservas",   icon: CalendarDays },
];

const INFO_ITEMS = [
    { href: "/nosotros", label: "Nosotros",  icon: Users },
    { href: "/contact",  label: "Contacto",  icon: Mail },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActivePath(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href);
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
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function PublicNav({ mobileOpen = false, onMobileClose }: Props) {
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
                    <Link href="/inicio" className="flex items-center" aria-label="Picadito inicio">
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

            {/* Tagline card */}
            {!collapsed && (
                <div className="px-4 pt-4">
                    <div className="flex h-[80px] items-center gap-4 rounded-2xl border border-[#24465a] bg-[#0b2637] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0c3043] text-[#45cfff]">
                            <MapPin className="h-4 w-4" strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold leading-4 text-[#f1f8fb]">
                                Encontrá tu cancha
                            </span>
                            <span className="mt-1 block truncate text-[11px] leading-4 text-[#70889a]">
                                Las mejores canchas cerca tuyo
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* Nav sections */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-4">
                {/* EXPLORAR */}
                <div className={`border-t border-[#142c3a] px-3 pt-5 ${collapsed ? "border-0 pt-2" : ""}`}>
                    <SectionLabel label="Explorar" collapsed={collapsed} />
                    <div className="space-y-1">
                        {EXPLORE_ITEMS.map(({ href, label, icon }) => (
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

                {/* INFORMACIÓN */}
                <div className={`mt-6 border-t border-[#142c3a] px-3 pt-5 ${collapsed ? "mt-4" : ""}`}>
                    <SectionLabel label="Información" collapsed={collapsed} />
                    <div className="space-y-1">
                        {INFO_ITEMS.map(({ href, label, icon }) => (
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

            {/* Cerrar sesión */}
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
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

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

// ─── Mobile hamburger button ──────────────────────────────────────────────────

interface HamburgerProps {
    onClick: () => void;
}

export function PublicMobileMenuButton({ onClick }: HamburgerProps) {
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
