import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Users,
  Droplets,
  ShowerHead,
  Lightbulb,
  ParkingCircle,
  Lock,
  Wifi,
  ArrowLeft,
  CalendarCheck,
  Phone,
} from "lucide-react";
import { fetchFromApi } from "@/lib/api/server-fetch";
import { PublicShell } from "@/app/inicio/_components/PublicShell";
import type { PitchDetail } from "@/lib/actions/pitchDetail";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PITCH_IMAGES = [
  "/pitches/pitch-1.png",
  "/pitches/pitch-2.png",
  "/pitches/pitch-3.png",
];

function getPitchImage(id: string): string {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PITCH_IMAGES[hash % PITCH_IMAGES.length];
}

const TYPE_LABELS: Record<string, string> = {
  FiveV5:    "Fútbol 5  (5 vs 5)",
  SevenV7:   "Fútbol 7  (7 vs 7)",
  NineV9:    "Fútbol 9  (9 vs 9)",
  ElevenV11: "Fútbol 11 (11 vs 11)",
};

const SURFACE_LABELS: Record<string, string> = {
  natural:   "Pasto Natural",
  sintetico: "Césped Sintético",
  cemento:   "Cemento",
};

/** Formatea un número como moneda local argentina. */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Amenity badge ─────────────────────────────────────────────────────────────

function AmenityBadge({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <span className="flex items-center gap-2 rounded-full border border-[#1cff87]/30 bg-[#071b28] px-4 py-2 text-sm font-semibold text-[#c8e8d4]">
      <Icon className="h-4 w-4 text-[#1cff87]" strokeWidth={1.8} />
      {label}
    </span>
  );
}

// ── Spec card ─────────────────────────────────────────────────────────────────

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1b3442] bg-[#071b28] p-4">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1cff87]">
        {label}
      </p>
      <p className="text-base font-bold text-white">{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CanchaDetailPage({ params }: PageProps) {
  const { id } = await params;

  // ── Fetch via .NET API (proxy) ───────────────────────────────────────────
  type ApiPitch = {
    id: string;
    name: string;
    venueId: string;
    venueName: string;
    type: string;
    surface: string;
    pricePerHour: number;
    isActive: boolean;
  };

  let pitch: PitchDetail;

  try {
    const dto = await fetchFromApi<ApiPitch>(`/api/proxy/pitches/${id}`);

    if (!dto || !dto.id) notFound();

    // Mapear PitchDto → PitchDetail
    // Los campos de amenidades y ubicación no están en PitchDto aún—usamos defaults
    pitch = {
      id:             dto.id,
      name:           dto.name,
      venueId:        dto.venueId,
      venueName:      dto.venueName,
      type:           dto.type as PitchDetail["type"],
      surface:        (dto.surface ?? "sintetico") as PitchDetail["surface"],
      pricePerHour:   dto.pricePerHour,
      priceFormatted: formatCurrency(dto.pricePerHour),
      isActive:       dto.isActive,
      // Campos extendidos — defaults hasta que el backend los exponga
      description:    null,
      hasShowers:     false,
      hasLedLighting: false,
      hasParking:     false,
      hasLockers:     false,
      hasWifi:        false,
      venueCity:      "",
      venueAddress:   "",
      venueWhatsapp:  null,
      venueLatitude:  null,
      venueLongitude: null,
    };
  } catch (err) {
    console.error("[CanchaDetailPage] fetchFromApi error:", err);
    notFound();
  }
  const imgSrc = getPitchImage(pitch.id);
  const typeLabel = TYPE_LABELS[pitch.type] ?? pitch.type;
  const surfaceLabel = SURFACE_LABELS[pitch.surface ?? ""] ?? pitch.surface;

  const hasAnyAmenity =
    pitch.hasShowers ||
    pitch.hasLedLighting ||
    pitch.hasParking ||
    pitch.hasLockers ||
    pitch.hasWifi;

  return (
    <PublicShell>
      <div className="min-h-full bg-[#0a1118] text-[#9eb2bf]">

        {/* ── Hero image ────────────────────────────────────────────────── */}
        <div className="relative h-72 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={imgSrc}
            alt={pitch.venueName}
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] via-[#0a1118]/40 to-transparent" />

          {/* Back button */}
          <div className="absolute top-5 left-5">
            <Link
              href="/inicio"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1b3442] bg-[#071b28]/80 px-4 py-2 text-sm font-semibold text-[#9eb2bf] backdrop-blur-sm transition hover:border-[#2c5368] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-5 right-5 flex gap-2">
            {pitch.isActive && (
              <span className="rounded-full bg-[#1cff87] px-3 py-1 text-xs font-black text-[#071b28]">
                Disponible hoy
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {surfaceLabel}
            </span>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">

          {/* Title row */}
          <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                {pitch.venueName}
              </h1>
              <p className="mt-1 text-[#577080] text-sm font-medium">
                {pitch.name}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#8ca3b2]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#1cff87]" strokeWidth={1.7} />
                  {pitch.venueAddress}
                  {pitch.venueCity && `, ${pitch.venueCity}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-semibold">—</span>
                  <span className="text-[#577080]">sin reseñas aún</span>
                </span>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="shrink-0 rounded-2xl border border-[#1b3442] bg-[#071b28] p-5 sm:min-w-[220px] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1cff87]">
                Precio por hora
              </p>
              <p className="mt-1 text-4xl font-black text-white">
                {pitch.priceFormatted}
              </p>
            
              {pitch.venueWhatsapp && (
                <a
                  href={`https://wa.me/${pitch.venueWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1b3442] py-2.5 text-sm font-semibold text-[#9eb2bf] transition hover:border-[#2c5368] hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ── Main grid ─────────────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

            {/* Left column */}
            <div className="space-y-6">

              {/* Specs */}
              <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6">
                <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#577080]">
                  Especificaciones
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <SpecCard label="Modalidad" value={typeLabel} />
                  <SpecCard label="Superficie" value={surfaceLabel ?? "—"} />
                  <SpecCard label="Precio / hora" value={pitch.priceFormatted} />
                </div>
              </section>

              {/* Description */}
              {pitch.description && (
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6">
                  <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#577080]">
                    Descripción
                  </h2>
                  <p className="leading-relaxed text-[#8ca3b2] text-sm">
                    {pitch.description}
                  </p>
                </section>
              )}

              {/* Amenities */}
              {hasAnyAmenity && (
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6">
                  <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#577080]">
                    Comodidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <AmenityBadge icon={ShowerHead}    label="Vestuarios"       active={pitch.hasShowers} />
                    <AmenityBadge icon={Lightbulb}     label="Iluminación LED"  active={pitch.hasLedLighting} />
                    <AmenityBadge icon={ParkingCircle} label="Parking Gratuito" active={pitch.hasParking} />
                    <AmenityBadge icon={Lock}          label="Casilleros"       active={pitch.hasLockers} />
                    <AmenityBadge icon={Wifi}          label="Wifi Gratis"      active={pitch.hasWifi} />
                  </div>
                </section>
              )}

              {/* Ubicación */}
              <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6">
                <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#577080]">
                  Ubicación
                </h2>
                {pitch.venueLatitude && pitch.venueLongitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${pitch.venueLatitude},${pitch.venueLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-40 w-full items-center justify-center gap-3 rounded-xl border border-[#1b3442] bg-[#050d13] text-sm font-semibold text-[#1cff87] transition hover:border-[#2c5368]"
                  >
                    <MapPin className="h-5 w-5" />
                    Ver en Google Maps
                  </a>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl border border-[#1b3442] bg-[#050d13]">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-2 h-8 w-8 text-[#1cff87]" strokeWidth={1.5} />
                      <p className="text-sm text-[#577080]">
                        {pitch.venueAddress}
                        {pitch.venueCity && `, ${pitch.venueCity}`}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right column — sticky CTA */}
            <aside className="space-y-4">
              <div className="sticky top-6 rounded-2xl border border-[#1b3442] bg-[#071b28] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <h3 className="mb-1 text-lg font-black text-white">
                  ¿Listo para jugar?
                </h3>
                <p className="mb-4 text-sm text-[#577080]">
                  Elegí tu fecha y turno en segundos.
                </p>

                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-[#1b3442] bg-[#050d13] px-4 py-3">
                    <Users className="h-4 w-4 text-[#1cff87]" strokeWidth={1.8} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1cff87]">Modalidad</p>
                      <p className="text-sm font-semibold text-white">{typeLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-[#1b3442] bg-[#050d13] px-4 py-3">
                    <Droplets className="h-4 w-4 text-[#1cff87]" strokeWidth={1.8} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1cff87]">Superficie</p>
                      <p className="text-sm font-semibold text-white">{surfaceLabel}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/inicio/cancha/${pitch.id}/turnos`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1cff87] py-3 text-sm font-black text-[#071b28] shadow-[0_8px_24px_rgba(28,255,135,0.25)] transition hover:bg-[#00e676] active:scale-95"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Ver disponibilidad
                </Link>

                <div className="mt-4 space-y-2 text-xs text-[#577080]">
                  <p className="flex items-center gap-2">
                    <span className="text-[#1cff87]">✓</span>
                    Cancelación gratuita hasta 24 hs antes
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-[#1cff87]">✓</span>
                    Confirmación instantánea
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
