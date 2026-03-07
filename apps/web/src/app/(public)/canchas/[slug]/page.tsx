import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVenueBySlug } from "@/lib/queries/venues";
import { getMatchesByVenue } from "@/lib/queries/matches";
import { MapPin, Phone, Star, Clock, Info, ShieldCheck, Search } from "lucide-react";
import Image from "next/image";
import { VenueBookingSection } from "@/components/bookings/VenueBookingSection";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const venue = await getVenueBySlug(slug);
    if (!venue) return { title: "Cancha no encontrada" };

    const description = venue.description
        ?? `Reservá en ${venue.name}, ${venue.city}. ${venue.pitches?.length ?? 0} canchas disponibles.`;

    return {
        title: venue.name,
        description,
        openGraph: {
            title: `${venue.name} | CanchaYa`,
            description,
            type: "website",
            locale: "es_AR",
            siteName: "CanchaYa",
        },
        twitter: {
            card: "summary_large_image",
            title: venue.name,
            description,
        },
        alternates: { canonical: `/canchas/${slug}` },
    };
}

const PITCH_LABELS: Record<string, string> = {
    f5: "Fútbol 5", f7: "Fútbol 7", f9: "Fútbol 9", f11: "Fútbol 11",
};

export default async function VenuePage({ params }: Props) {
    const { slug } = await params;

    // In a real scenario we use matches or similar
    const [venue, recentMatches] = await Promise.all([
        getVenueBySlug(slug),
        getMatchesByVenue("").catch(() => []),
    ]);

    if (!venue) notFound();

    const ratings = (venue as any).venue_ratings as { rating: number }[] ?? [];
    const avgRating = ratings.length
        ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
        : null;

    const pitches = venue.pitches as any[] ?? [];

    return (
        <main className="min-h-screen pb-24">
            {/* Hero Section */}
            <div className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] w-full overflow-hidden bg-muted">
                {/* Fallback pattern or real image */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-sm mix-blend-overlay">
                    <Image
                        src="/placeholder.svg"
                        alt="Venue Background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-50 grayscale"
                    />
                </div>

                {/* Hero Content positioned at bottom left */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 sm:px-8 max-w-7xl mx-auto">
                    <div className="animate-fade-in-up">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide">
                                {pitches.length} Canchas
                            </span>
                            {avgRating && (
                                <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-3 py-1 text-xs font-bold rounded-full">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    {avgRating} ({ratings.length} reseñas)
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight max-w-3xl leading-tight">
                            {venue.name}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground font-medium sm:text-lg">
                            <span className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {venue.address}, {venue.city}
                            </span>
                            {venue.whatsapp && (
                                <a
                                    href={`https://wa.me/${venue.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
                                >
                                    <Phone className="h-5 w-5" />
                                    Contactar
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column (Info) */}
                <div className="col-span-1 space-y-8 animate-fade-in">

                    {/* About Section */}
                    {venue.description && (
                        <section className="bg-card p-6 rounded-2xl border shadow-sm">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" /> Sobre el complejo
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
                        </section>
                    )}

                    {/* Features/Trust badges */}
                    <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 text-sm">
                        <h4 className="font-bold flex items-center gap-2 mb-4 text-foreground">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Reserva Protegida
                        </h4>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="bg-primary/20 rounded-full h-5 w-5 flex items-center justify-center text-[10px] text-primary mt-0.5">✓</span>
                                Confirmación al instante por WhatsApp y E-mail.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-primary/20 rounded-full h-5 w-5 flex items-center justify-center text-[10px] text-primary mt-0.5">✓</span>
                                Pagá por MercadoPago o en el complejo.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-primary/20 rounded-full h-5 w-5 flex items-center justify-center text-[10px] text-primary mt-0.5">✓</span>
                                Puntos para el ranking y votación de MVP.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column (Pitches & Booking) */}
                <div className="col-span-1 lg:col-span-2 space-y-8">

                    {/* Pitches List */}
                    <section>
                        <h2 className="text-2xl font-bold mb-5">Canchas e instalaciones</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {pitches.map((pitch: any) => (
                                <div key={pitch.id} className="relative overflow-hidden group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/40">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="bg-accent text-accent-foreground px-2.5 py-1 text-xs font-semibold rounded-full">
                                            {PITCH_LABELS[pitch.pitch_type] || pitch.pitch_type}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground pr-20">{pitch.name}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground capitalize">Superficie: {pitch.surface?.replace('_', ' ')}</p>

                                    <div className="mt-6 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Costo por hora</p>
                                            <p className="text-3xl font-black text-primary">
                                                ${pitch.price_per_hour.toLocaleString("es-AR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr className="border-border/60" />

                    {/* The NEW Interactive Booking Calendar component */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold">Disponibilidad y Reservas</h2>
                        </div>
                        <VenueBookingSection pitches={pitches} />
                    </section>

                </div>
            </div>
        </main>
    );
}
