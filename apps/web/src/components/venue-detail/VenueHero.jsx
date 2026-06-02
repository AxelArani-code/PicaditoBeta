"use client";

import { MapPin, Star } from "lucide-react";

export default function VenueHero({ venue }) {
  return (
    <section className="rounded-[2rem] overflow-hidden border border-white/10 bg-[#08110a]/90 shadow-[0_25px_80px_-50px_rgba(0,255,147,0.33)]">
      <div className="relative h-[420px] sm:h-[480px] lg:h-[520px]">
        <img src={venue.coverImage} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020600]/95 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <span className="rounded-full border border-[#4be176]/30 bg-[#4be176]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#7fffb5]">{venue.venueType}</span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{venue.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#dce5d9]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2">
              <MapPin className="h-4 w-4 text-[#6bfe8f]" /> {venue.address}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2">
              <Star className="h-4 w-4 text-[#ffd05a]" /> {venue.rating?.toFixed(1) ?? "4.8"} / 5.0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
