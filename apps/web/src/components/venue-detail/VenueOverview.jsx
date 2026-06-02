"use client";

export default function VenueOverview({ venue }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-6 shadow-[0_20px_55px_-35px_rgba(0,255,147,0.15)]">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <h2 className="text-2xl font-semibold text-white">Detalles del complejo</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c5d9c4]">
            {venue.description}
          </p>
        </div>
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-[#0f1f14]/80 p-4">
            <span className="text-sm text-[#99f7c6]">Capacidad</span>
            <strong className="text-base text-white">{venue.capacity ?? "Hasta 30 jugadores"}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-[#0f1f14]/80 p-4">
            <span className="text-sm text-[#99f7c6]">Superficie</span>
            <strong className="text-base text-white">{venue.surface ?? "Césped sintético"}</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-[#0f1f14]/80 p-4">
            <span className="text-sm text-[#99f7c6]">Horario</span>
            <strong className="text-base text-white">{venue.hours || "8:00 - 23:00"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
