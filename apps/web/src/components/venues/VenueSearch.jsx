"use client";

export default function VenueSearch({ search, onSearch }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20">
      <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#7fffb5]">Buscar complejo</label>
      <input
        type="search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Buscar por nombre, ciudad o cancha..."
        className="w-full rounded-3xl border border-white/10 bg-[#0d170e]/90 px-4 py-3 text-sm text-white outline-none transition focus:border-[#4be176]/40"
      />
    </div>
  );
}
