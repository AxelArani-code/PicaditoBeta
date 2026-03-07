import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: {
        default: "Picadito - Reservas de fútbol amateur",
        template: "%s | Picadito",
    },
    description:
        "Reservá canchas de fútbol, organizá partidos y gestioná tu equipo. La plataforma de la comunidad futbolera amateur.",
    keywords: ["fútbol", "canchas", "reservas", "fútbol amateur", "partidos"],
    openGraph: {
        type: "website",
        locale: "es_AR",
        siteName: "Picadito",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                {children}
                <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
