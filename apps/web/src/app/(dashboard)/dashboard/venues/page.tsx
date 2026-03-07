import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, Settings } from "lucide-react";

export default async function VenuesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: venues } = await supabase
        .from("venues")
        .select("*, pitches(count)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="animate-fade-in space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-2xl font-bold">Mis Complejos</h1>
                    <p className="text-muted-foreground">Gestioná tus canchas y reservas</p>
                </div>
                <Link href="/dashboard/venues/nuevo"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Nuevo complejo
                </Link>
            </div>

            {!venues?.length ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                    <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">No tenés complejos aún</h2>
                    <p className="mt-1 text-muted-foreground text-sm">Creá tu primer complejo para empezar a recibir reservas</p>
                    <Link href="/dashboard/venues/nuevo"
                        className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Crear complejo
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {venues.map((venue) => {
                        const pitchCount = (venue.pitches as any)?.[0]?.count ?? 0;
                        return (
                            <div key={venue.id} className="pitch-card p-5">
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h2 className="font-semibold text-lg">{venue.name}</h2>
                                        <p className="text-sm text-muted-foreground">{venue.city} · {venue.address}</p>
                                    </div>
                                </div>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {pitchCount} {pitchCount === 1 ? "cancha" : "canchas"}
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/venues/${venue.id}`}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
                                        <Settings className="h-3.5 w-3.5" /> Gestionar
                                    </Link>
                                    <Link href={`/canchas/${venue.slug}`} target="_blank"
                                        className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary">
                                        Ver pública
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
