import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

  let dto: ApiPitch;

  try {
    const result = await fetchFromApi<ApiPitch>(`/api/proxy/pitches/${id}`);
    if (!result || !result.id) notFound();
    dto = result;
  } catch (err) {
    console.error("[TurnosPage] fetchFromApi error:", err);
    notFound();
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
