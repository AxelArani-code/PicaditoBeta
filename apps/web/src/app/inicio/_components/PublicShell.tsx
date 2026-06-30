"use client";

import { useState } from "react";
import { PublicNav, PublicMobileMenuButton } from "@/components/shared/PublicNav/PublicNav";

interface Props {
    children: React.ReactNode;
}

/**
 * Shell para las páginas públicas que usan el sidebar (ej: /inicio).
 * Maneja el estado del menú mobile en el cliente.
 */
export function PublicShell({ children }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a1118]">
            <PublicNav
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile top bar */}
                <header className="flex lg:hidden items-center gap-4 border-b border-[#1b3442] bg-[#071b28] px-4 py-3">
                    <PublicMobileMenuButton onClick={() => setMobileOpen((v) => !v)} />
                    <img
                        src="/logo-picadito.png"
                        alt="Picadito"
                        className="h-7 w-auto object-contain"
                    />
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
