"use client";

import { MapPin, Phone, Sparkles } from "lucide-react";

export default function VenueLocationInfo({ venue }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-6 shadow-[0_20px_45px_-30px_rgba(0,255,147,0.15)]">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h3 className="text-xl font-semibold text-white">Ubicación & servicios</h3>
          <p className="mt-4 text-sm leading-7 text-[#c5d9c4]">
            {venue.locationSummary || "Un lugar ideal con acceso rápido, estacionamiento y vestuarios modernos."}
          </p>
        </div>
        <div className="space-y-4 rounded-[1.75rem] bg-black/40 p-5">
          <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-[#0f1f14]/60 p-4">
            <MapPin className="h-5 w-5 text-[#7fffb5]" />
            <div>
              <p className="text-sm font-semibold text-white">Dirección</p>
              <p className="mt-1 text-sm text-[#c5d9c4]">{venue.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-[#0f1f14]/60 p-4">
            <Phone className="h-5 w-5 text-[#7fffb5]" />
            <div>
              <p className="text-sm font-semibold text-white">Contacto</p>
              <p className="mt-1 text-sm text-[#c5d9c4]">{venue.phone || "No disponible"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-[#0f1f14]/60 p-4">
            <Sparkles className="h-5 w-5 text-[#7fffb5]" />
            <div>
              <p className="text-sm font-semibold text-white">Extras</p>
              <p className="mt-1 text-sm text-[#c5d9c4]">{venue.amenities?.join(" · ") ?? "Vestuario · Iluminación nocturna · Wi-Fi"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
