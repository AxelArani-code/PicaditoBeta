import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, CalendarCheck, Trophy, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const isOwner = profile?.role === "venue_owner" || profile?.role === "admin";

    // Stats paralelas
    const [bookingsRes, matchesRes, teamsRes, venuesRes] = await Promise.all([
        supabase.from("bookings").select("id, status", { count: "exact" }).eq("created_by", user.id),
        supabase.from("match_players").select("match_id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("team_members").select("team_id", { count: "exact" }).eq("user_id", user.id),
        isOwner
            ? supabase.from("venues").select("id", { count: "exact" }).eq("owner_id", user.id)
            : Promise.resolve({ count: 0 }),
    ]);

    const pendingBookings = bookingsRes.data?.filter((b) => b.status === "pending").length ?? 0;

    const stats = [
        {
            label: "Reservas",
            value: bookingsRes.count ?? 0,
            sub: `${pendingBookings} pendientes`,
            icon: CalendarCheck,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            href: "/dashboard/reservas",
        },
        {
            label: "Partidos",
            value: matchesRes.count ?? 0,
            sub: "jugados",
            icon: Trophy,
            color: "text-green-400",
            bg: "bg-green-400/10",
            href: "/dashboard/partidos",
        },
        {
            label: "Equipos",
            value: teamsRes.count ?? 0,
            sub: "en los que participás",
            icon: Users,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            href: "/dashboard/equipos",
        },
        ...(isOwner
            ? [{
                label: "Complejos",
                value: (venuesRes as any).count ?? 0,
                sub: "gestionados",
                icon: Building2,
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                href: "/dashboard/venues",
            }]
            : []),
    ];

    const displayName = profile?.full_name ?? profile?.username ?? "Jugador";

    return (
        <div className="animate-fade-in space-y-8">
            {/* Saludo */}
            <div>
                <h1 className="text-2xl font-bold">Bienvenido, {displayName}</h1>
                <p className="text-muted-foreground mt-1">Acá está tu resumen de actividad.</p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
                    <Link key={label} href={href}
                        className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:-translate-y-0.5">
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <p className="text-3xl font-black">{value}</p>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="mb-4 text-lg font-semibold">Acciones rápidas</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/canchas"
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Reservar cancha</p>
                            <p className="text-xs text-muted-foreground">Buscá disponibilidad</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/equipos/nuevo"
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/15">
                            <Users className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="font-medium">Crear equipo</p>
                            <p className="text-xs text-muted-foreground">Armá tu equipo</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/ranking"
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/15">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium">Ver ranking</p>
                            <p className="text-xs text-muted-foreground">Clasificación de jugadores</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
