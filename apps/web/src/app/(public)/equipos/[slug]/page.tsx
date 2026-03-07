import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamBySlug } from "@/lib/queries/teams";
import { Users, MapPin, Shield } from "lucide-react";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const team = await getTeamBySlug(slug);
    if (!team) return { title: "Equipo no encontrado" };

    const memberCount = (team as any).team_members?.length ?? 0;
    const description = `Equipo de fútbol ${team.name}${team.city ? ` de ${team.city}` : ""}. ${memberCount} jugadores.`;

    return {
        title: team.name,
        description,
        openGraph: {
            title: `${team.name} | CanchaYa`,
            description,
            type: "website",
            locale: "es_AR",
        },
        twitter: { card: "summary", title: team.name, description },
        alternates: { canonical: `/equipos/${slug}` },
    };
}

export default async function TeamPage({ params }: Props) {
    const { slug } = await params;
    const team = await getTeamBySlug(slug);
    if (!team) notFound();

    const members = (team as any).team_members as {
        role: string;
        profiles: { id: string; username: string; full_name: string | null; avatar_url: string | null };
    }[] ?? [];

    const captain = members.filter((m) => m.role === "captain");
    const players = members.filter((m) => m.role === "player");

    return (
        <main className="page-container animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex items-start gap-6">
                <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white"
                    style={{ background: "hsl(142,70%,35%)" }}
                >
                    {team.logo_url
                        ? <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-2xl object-cover" />
                        : team.name.slice(0, 2).toUpperCase()
                    }
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{team.name}</h1>
                    {team.city && (
                        <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" /> {team.city}
                        </p>
                    )}
                    <div className="mt-2 flex gap-2">
                        <span className="stat-badge"><Users className="h-3.5 w-3.5" /> {members.length} jugadores</span>
                    </div>
                </div>
            </div>

            {/* Capitanes */}
            {captain.length > 0 && (
                <section className="mb-6">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <Shield className="h-4 w-4 text-yellow-400" /> Capitán
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {captain.map((m) => (
                            <a key={m.profiles.id} href={`/jugadores/${m.profiles.username}`}
                                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {m.profiles.avatar_url
                                        ? <img src={m.profiles.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
                                        : (m.profiles.full_name ?? m.profiles.username).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold">{m.profiles.full_name ?? m.profiles.username}</p>
                                    <p className="text-xs text-muted-foreground">@{m.profiles.username}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* Jugadores */}
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Jugadores
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {players.map((m) => (
                        <a key={m.profiles.id} href={`/jugadores/${m.profiles.username}`}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                                {m.profiles.avatar_url
                                    ? <img src={m.profiles.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
                                    : (m.profiles.full_name ?? m.profiles.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium">{m.profiles.full_name ?? m.profiles.username}</p>
                                <p className="text-xs text-muted-foreground">@{m.profiles.username}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </main>
    );
}
