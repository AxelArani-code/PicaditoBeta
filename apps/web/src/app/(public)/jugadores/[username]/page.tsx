import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/queries/players";
import { PlayerQrCard } from "@/components/players/PlayerQrCard";
import { Trophy, Target, Zap, Calendar, Star } from "lucide-react";

interface Props {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const result = await getPlayerProfile(username);
    if (!result) return { title: "Jugador no encontrado" };

    const { profile, stats } = result;
    const name = profile.full_name ?? profile.username;
    const description = `Perfil de ${name} en CanchaYa. ${stats?.matches_played ?? 0} partidos, ${stats?.goals ?? 0} goles, ${stats?.assists ?? 0} asistencias.`;

    return {
        title: name,
        description,
        openGraph: {
            title: `${name} | CanchaYa`,
            description,
            type: "profile",
            locale: "es_AR",
            images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
        },
        twitter: {
            card: "summary",
            title: name,
            description,
            images: profile.avatar_url ? [profile.avatar_url] : [],
        },
        alternates: { canonical: `/jugadores/${username}` },
    };
}

export default async function PlayerProfilePage({ params }: Props) {
    const { username } = await params;
    const result = await getPlayerProfile(username);
    if (!result) notFound();

    const { profile, stats, teams, recentMatches } = result;
    const displayName = profile.full_name ?? profile.username;
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://canchaya.com"}/jugadores/${username}`;

    const statItems = [
        { icon: Calendar, label: "Partidos", value: stats?.matches_played ?? 0, color: "text-blue-400" },
        { icon: Target, label: "Goles", value: stats?.goals ?? 0, color: "text-green-400" },
        { icon: Zap, label: "Asistencias", value: stats?.assists ?? 0, color: "text-yellow-400" },
        { icon: Star, label: "MVPs", value: stats?.mvp_count ?? 0, color: "text-purple-400" },
    ];

    return (
        <main className="page-container animate-fade-in">
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Columna izquierda: perfil + QR */}
                <div className="space-y-6">
                    {/* Avatar + info */}
                    <div className="rounded-2xl border border-border bg-card p-6 text-center">
                        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-secondary">
                            {profile.avatar_url
                                ? <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                                : <div className="flex h-full w-full items-center justify-center text-4xl font-black text-primary">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            }
                        </div>
                        <h1 className="text-2xl font-bold">{displayName}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                        {profile.city && (
                            <p className="mt-1 text-sm text-muted-foreground">{profile.city}</p>
                        )}
                    </div>

                    {/* QR Card */}
                    <PlayerQrCard username={username} profileUrl={profileUrl} displayName={displayName} />

                    {/* Equipos */}
                    {(teams as any[])?.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Equipos
                            </h2>
                            <div className="space-y-2">
                                {(teams as any[]).map((t: any) => (
                                    <a key={t.teams.id} href={`/equipos/${t.teams.slug}`}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-secondary">
                                        <span className="font-medium">{t.teams.name}</span>
                                        <span className="text-xs text-muted-foreground capitalize">{t.role}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna derecha: estadísticas + historial */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {statItems.map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
                                <Icon className={`mx-auto mb-2 h-6 w-6 ${color}`} />
                                <p className="text-3xl font-black">{value}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Historial de partidos */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-lg font-semibold">Historial de partidos</h2>
                        {!(recentMatches as any[])?.length ? (
                            <p className="text-muted-foreground text-sm">Aún no hay partidos registrados.</p>
                        ) : (
                            <div className="space-y-3">
                                {(recentMatches as any[]).map((mp: any) => {
                                    const match = mp.matches;
                                    return (
                                        <div key={match.id}
                                            className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                                            <div>
                                                <p className="font-medium text-sm">{match.pitches?.venues?.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(match.date).toLocaleDateString("es-AR")} · {match.pitches?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                {match.status === "played" && (
                                                    <span className="font-bold text-foreground">
                                                        {match.score_a} - {match.score_b}
                                                    </span>
                                                )}
                                                {mp.goals > 0 && (
                                                    <span className="stat-badge text-green-400">⚽ {mp.goals}</span>
                                                )}
                                                {mp.assists > 0 && (
                                                    <span className="stat-badge text-yellow-400">🎯 {mp.assists}</span>
                                                )}
                                                {mp.is_mvp && (
                                                    <span className="stat-badge text-purple-400">⭐ MVP</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
