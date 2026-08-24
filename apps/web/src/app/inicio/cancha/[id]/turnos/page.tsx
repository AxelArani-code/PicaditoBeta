import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { fetchFromApi } from "@/lib/api/server-fetch";
import { PublicShell } from "@/app/inicio/_components/PublicShell";
import TurnosClient from "./_components/TurnosClient";
import type { BookingPitch } from "./_components/booking.types";

// ── Page (Server Component) ───────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TurnosPage({ params }: PageProps) {
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

  let dto: ApiPitch | null = null;
  let fetchError: string | null = null;

  try {
    const result = await fetchFromApi<ApiPitch>(`/Pitches/${id}`);
    if (!result || !result.id) notFound(); // Genuine 404 — pitch doesn't exist
    dto = result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TurnosPage] fetchFromApi error:", message);

    // Only propagate as notFound if it was a real 404 from the backend
    if (message.includes("404")) {
      notFound();
    }

    // For any other error (401 expired token, 502 backend down, network, etc.)
    // render a friendly error UI instead of a misleading 404 page.
    fetchError = message;
  }

  // ── If we couldn't load the pitch, show an inline error state ────────────
  if (fetchError || !dto) {
    return (
      <PublicShell>
        <div className="min-h-full bg-[#0a1118] text-[#9eb2bf]">
          <div className="border-b border-[#1b3442] bg-[#071b28] px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <Link
                href="/inicio"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#577080] transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
            </span>
            <h1 className="text-2xl font-black text-white">No pudimos cargar la cancha</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#577080]">
              Ocurrió un error al conectar con el servidor. Por favor, intentá de nuevo en unos segundos.
            </p>
            <p className="mt-2 text-xs text-[#3a5568]">{fetchError}</p>
            <Link
              href="/inicio"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#4be176] px-6 py-3 text-sm font-black text-[#071b28] shadow-[0_8px_28px_rgba(75,225,118,0.25)] transition hover:brightness-110"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </PublicShell>
    );
  }

  // Map ApiPitch → BookingPitch (solo campos que necesita el cliente)
  const pitch: BookingPitch = {
    id:             dto.id,
    name:           dto.name,
    venueName:      dto.venueName,
    venueAddress:   "",   // No expuésto por la API aún
    venueCity:      "",
    type:           dto.type as BookingPitch["type"],
    surface:        dto.surface as BookingPitch["surface"],
    pricePerHour:   dto.pricePerHour,
    priceFormatted: new Intl.NumberFormat("es-AR", {
      style: "currency", currency: "ARS",
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(dto.pricePerHour),
    venueWhatsapp:  null,
  };

  // Deterministic pitch image from local pool
  const PITCH_IMAGES = [
    "/pitches/pitch-1.png",
    "/pitches/pitch-2.png",
    "/pitches/pitch-3.png",
  ];
  const hash   = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const imgSrc = PITCH_IMAGES[hash % PITCH_IMAGES.length];

  return (
    <PublicShell>
      <div className="min-h-full bg-[#0a1118] text-[#9eb2bf]">

        {/* Top breadcrumb */}
        <div className="border-b border-[#1b3442] bg-[#071b28] px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <Link
              href={`/inicio/cancha/${id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#577080] transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {pitch.venueName}
            </Link>
            <span className="text-[#1b3442]">/</span>
            <span className="text-sm font-semibold text-white">Elegí tu turno</span>
          </div>
        </div>

        {/* Client component — handles all date/slot selection & Supabase fetching */}
        <TurnosClient pitch={pitch} pitchImageSrc={imgSrc} />
      </div>
    </PublicShell>
  );
}
