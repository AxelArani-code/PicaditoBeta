import Link from "next/link";
import { getVenues } from "@/lib/queries/venues";
import { MapPin, Star, Clock, Trophy, Calendar, Users, Target, LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Picadito - Reservas de fútbol amateur",
    description: "Encontrá y reservá canchas de fútbol cerca tuyo. La plataforma de la comunidad futbolera amateur de Argentina.",
};

export default async function HomePage() {
    const venues = await getVenues().catch(() => []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-black transition-opacity hover:opacity-90">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <Target className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <span className="tracking-tight text-foreground">Pica<span className="text-primary">dito</span></span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/ranking" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">
                            Ranking
                        </Link>
                        <Link href="/login"
                            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
                            Ingresar
                        </Link>
                        <Link href="/register"
                            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-pitch-pattern opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background" />
                <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Trophy className="h-4 w-4" /> La plataforma nº 1 de fútbol amateur
                    </span>
                    <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
                        Reservá tu cancha,{" "}
                        <span className="text-primary">jugá tu partido</span>
                    </h1>
                    <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                        Encontrá canchas disponibles, organizá tu equipo y llevá el historial
                        de tus partidos. Todo en un solo lugar.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link href="/canchas"
                            className="rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105">
                            Buscar canchas
                        </Link>
                        <Link href="/register"
                            className="rounded-xl border border-border px-8 py-3.5 text-base font-semibold transition-all hover:bg-secondary hover:scale-105">
                            Crear cuenta gratis
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-6 sm:grid-cols-3">
                    {[
                        { icon: <Calendar className="h-8 w-8 text-primary" />, title: "Reservas en tiempo real", desc: "Seleccioná el horario y reservá al instante. El dueño confirma en minutos." },
                        { icon: <LayoutDashboard className="h-8 w-8 text-primary" />, title: "Historial de partidos", desc: "Registrá goles, asistencias y el MVP de cada partido. Construí tu legado." },
                        { icon: <Target className="h-8 w-8 text-primary" />, title: "Ranking de jugadores", desc: "Competí por los primeros puestos del ranking de la comunidad." },
                    ].map((feature) => (
                        <div key={feature.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 transition-transform group-hover:scale-110">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Venues */}
            {venues.length > 0 && (
                <section className="mx-auto max-w-7xl px-6 py-8 pb-24">
                    <h2 className="mb-8 text-2xl font-bold">
                        Canchas destacadas
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {venues.slice(0, 6).map((venue: any) => (
                            <Link key={venue.id} href={`/canchas/${venue.slug}`} className="pitch-card p-5">
                                <h3 className="font-bold text-lg">{venue.name}</h3>
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4" /> {venue.city}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {(venue.pitches as any)?.[0]?.count ?? 0} canchas disponibles
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
                <p>© 2025 Picadito · Fútbol amateur en Argentina</p>
            </footer>
        </div>
    );
}
