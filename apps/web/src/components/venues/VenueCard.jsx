"use client";

import Link from "next/link";
import { MapPin, Star, ShieldCheck, Wifi, Sparkles, Clock3 } from "lucide-react";

export default function VenueCard({ venue }) {
  const availability = venue.availableSlotsCount ?? Math.floor(Math.random() * 3) + 1;

  return (
    <article className="group rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-5 shadow-[0_25px_80px_-50px_rgba(0,255,147,0.35)] transition hover:-translate-y-1 hover:border-[#4be176]/40 hover:bg-[#0e150e]/95">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-inner shadow-black/40">
        <img src={venue.coverImage} alt={venue.name} className="h-52 w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[#7fffb5]">{venue.tags?.join(" • ") ?? "Premium Venue"}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{venue.name}</h3>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm text-[#9ab59d]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#6bfe8f]" />
            <span>{venue.city}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#dce5d9]">
            <Star className="h-3.5 w-3.5 text-[#ffd05a]" /> {venue.rating?.toFixed(1) ?? "4.8"}
          </span>
        </div>

        <div className="grid gap-3 text-sm text-[#bccbb9] sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7fffb5]">Cancha</p>
            <p className="mt-2 font-semibold text-white">{venue.venueType}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7fffb5]">Tarifa</p>
            <p className="mt-2 font-semibold text-white">${Number(venue.pricePerHour || 0).toLocaleString("es-AR")}/h</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#dce5d9]">
            <Wifi className="h-4 w-4 text-[#6bfe8f]" /> {venue.amenities?.[0] ?? "Wi-Fi"}
          </div>
          <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#dce5d9]">
            <Sparkles className="h-4 w-4 text-[#7fffb5]" /> {venue.amenities?.[1] ?? "Iluminación"}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-[#bccbb9]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#6bfe8f]" /> Disponibilidad:
          </span>
          <span className="font-semibold text-white">{availability} turnos libres</span>
        </div>

        <Link href={`/venues/${venue.id}`} className="inline-flex w-full items-center justify-center rounded-3xl bg-[#4be176]/10 px-4 py-3 text-sm font-semibold text-[#dce5d9] transition hover:bg-[#4be176]/20">
          Ver disponibilidad
        </Link>
      </div>
    </article>
  );
}
