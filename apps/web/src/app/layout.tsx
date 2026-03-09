import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const inter = localFont({
    src: [
        {
            path: "./fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
            style: "normal",
        },
        {
            path: "./fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
            style: "italic",
        },
    ],
    variable: "--font-inter",
    display: "swap",
});

const raleway = localFont({
    src: [
        {
            path: "./fonts/Raleway/Raleway-VariableFont_wght.ttf",
            style: "normal",
        },
        {
            path: "./fonts/Raleway/Raleway-Italic-VariableFont_wght.ttf",
            style: "italic",
        },
    ],
    variable: "--font-raleway",
    display: "swap",
});

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
            <body className={`${inter.variable} ${raleway.variable} font-sans antialiased text-text-primary bg-background`}>
                {children}
                <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
