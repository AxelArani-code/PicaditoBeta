import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { BookingActions } from "@/components/bookings/BookingActions";
import { CalendarCheck, Clock, Search } from "lucide-react";

export default async function ReservasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isOwner = profile?.role === "venue_owner" || profile?.role === "admin";

    // Build the query depending on role
    // Since we denormalized date, we can sort easily
    let query = supabase
        .from("bookings")
        .select(`
            id,
            status,
            total_price,
            date,
            user_id,
            time_slots ( start_time, end_time ),
            pitches ( id, name, type, venues ( id, name, city, owner_id ) ),
            profiles!bookings_user_id_fkey ( username, full_name, avatar_url )
        `)
        .is("deleted_at", null)
        .order("date", { ascending: false });

    if (!isOwner) {
        query = query.eq("user_id", user.id);
    }

    const { data: rawBookings } = await query;

    // Filter local for owner (RLS handles it anyway, but just in case of admin)
    const bookings = isOwner
        ? (rawBookings ?? []).filter((b: any) => b.pitches?.venues?.owner_id === user.id || profile?.role === "admin")
        : (rawBookings ?? []);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {isOwner ? "Panel de Reservas" : "Mis Reservas"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {bookings.length} {bookings.length === 1 ? 'reserva' : 'reservas'} en total
                    </p>
                </div>
                {!isOwner && (
                    <Link href="/canchas"
                        className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                        <CalendarCheck className="h-4 w-4" /> Nueva reserva
                    </Link>
                )}
            </div>

            {!bookings.length ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/10 py-24 text-center">
                    <div className="rounded-full bg-muted/50 p-4 mb-4">
                        <Clock className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                    <h2 className="text-xl font-bold">Sin reservas aún</h2>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        {isOwner ? "Todavía no tienes reservas en tus complejos. ¡Comparte el enlace de tu cancha!" : "Aún no has hecho ninguna reserva. ¡Busca una cancha y empieza a jugar!"}
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Detalle Cancha</th>
                                    <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                                    {isOwner && <th className="px-6 py-4 font-semibold">Cliente</th>}
                                    <th className="px-6 py-4 font-semibold">Precio</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    {isOwner && <th className="px-6 py-4 font-semibold text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-base">{booking.pitches?.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {booking.pitches?.venues?.name}
                                                {booking.pitches?.venues?.city && ` · ${booking.pitches.venues.city}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 font-medium">
                                                <CalendarCheck className="h-4 w-4 text-primary" />
                                                {new Date(booking.date).toLocaleDateString("es-AR", { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {booking.time_slots?.start_time?.substring(0, 5)} - {booking.time_slots?.end_time?.substring(0, 5)}
                                            </div>
                                        </td>
                                        {isOwner && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {(booking.profiles?.full_name || booking.profiles?.username || "?")[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm leading-none">
                                                            {booking.profiles?.full_name || booking.profiles?.username || "Usuario"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 font-semibold text-primary">
                                            ${Number(booking.total_price).toLocaleString("es-AR")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <BookingStatusBadge status={booking.status} />
                                        </td>
                                        {isOwner && (
                                            <td className="px-6 py-4 text-right">
                                                {booking.status === "pending" ? (
                                                    <BookingActions bookingId={booking.id} />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No requiere acción</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
