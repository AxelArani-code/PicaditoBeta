import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPlayerRanking } from "@/lib/queries/matches";
import { TrendingUp, Medal } from "lucide-react";

export default async function RankingPage() {
    const ranking = await getPlayerRanking(50).catch(() => []);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-2xl font-bold">Ranking de Jugadores</h1>
                    <p className="text-muted-foreground">Los mejores de la comunidad</p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-secondary/50">
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Jugador</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">PJ</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">⚽</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">🎯</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">⭐</th>
                            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((player: any, idx: number) => {
                            const medals = ["🥇", "🥈", "🥉"];
                            const pos = idx + 1;
                            return (
                                <tr key={player.user_id}
                                    className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${idx < 3 ? "bg-primary/5" : ""}`}>
                                    <td className="px-4 py-3 font-semibold">
                                        {pos <= 3 ? medals[pos - 1] : pos}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/jugadores/${player.username}`}
                                            className="flex items-center gap-2 hover:text-primary">
                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                                {player.avatar_url
                                                    ? <img src={player.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
                                                    : (player.full_name ?? player.username).charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium">{player.full_name ?? player.username}</p>
                                                <p className="text-xs text-muted-foreground">@{player.username}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{player.matches_played}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-green-400">{player.goals}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-yellow-400">{player.assists}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-purple-400">{player.mvp_count}</td>
                                    <td className="px-4 py-3 text-center font-black text-primary">{player.ranking_score}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!ranking.length && (
                    <div className="py-12 text-center text-muted-foreground">
                        <TrendingUp className="mx-auto mb-3 h-10 w-10" />
                        <p>Aún no hay datos de ranking</p>
                    </div>
                )}
            </div>
        </div>
    );
}
