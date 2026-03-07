import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Plus } from "lucide-react";

export default async function PartidosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: matchPlayers } = await supabase
        .from("match_players")
        .select(`
      goals, assists, is_mvp,
      matches!inner(id, date, start_time, score_a, score_b, status,
        pitches!inner(name, venues!inner(name, slug)))
    `)
        .eq("user_id", user.id)
        .order("matches.date", { ascending: false })
        .limit(30);

    const matches = matchPlayers ?? [];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-2xl font-bold">Mis Partidos</h1>
                    <p className="text-muted-foreground">{matches.length} partidos registrados</p>
                </div>
            </div>

            {!matches.length ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                    <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Aún no jugaste partidos</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Reservá una cancha para que el dueño cree el partido automáticamente.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {matches.map((mp: any) => {
                        const match = mp.matches;
                        const isPlayed = match.status === "played";
                        return (
                            <Link key={match.id} href={`/dashboard/partidos/${match.id}`}
                                className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:-translate-y-0.5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{match.pitches?.venues?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {match.pitches?.name} · {new Date(match.date).toLocaleDateString("es-AR")} {match.start_time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isPlayed ? (
                                            <span className="text-xl font-black">
                                                {match.score_a} - {match.score_b}
                                            </span>
                                        ) : (
                                            <span className="status-pending rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                                Programado
                                            </span>
                                        )}
                                        <div className="flex gap-1.5">
                                            {mp.goals > 0 && <span className="stat-badge">⚽ {mp.goals}</span>}
                                            {mp.assists > 0 && <span className="stat-badge">🎯 {mp.assists}</span>}
                                            {mp.is_mvp && <span className="stat-badge text-purple-400">⭐ MVP</span>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
