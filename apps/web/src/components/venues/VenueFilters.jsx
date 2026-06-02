"use client";

export default function VenueFilters({ pitchType, surface, amenities, priceRange, onChange, onReset }) {
  return (
    <div className="space-y-4 rounded-[2rem] border border-white/10 bg-[#0d170e]/90 p-5 shadow-[0_20px_70px_-50px_rgba(0,0,0,0.65)]">
      <div>
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
          <span>Filtros</span>
          <button type="button" onClick={onReset} className="text-xs text-[#7fffb5] hover:text-white">
            Limpiar
          </button>
        </div>
        <label className="block text-xs uppercase tracking-[0.24em] text-[#7fffb5]">Tipo de cancha</label>
        <select value={pitchType} onChange={(event) => onChange({ pitchType: event.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-[#0e150e]/90 px-4 py-3 text-sm text-white outline-none transition focus:border-[#4be176]/40">
          <option value="">Todas</option>
          <option value="f5">Fútbol 5</option>
          <option value="f7">Fútbol 7</option>
          <option value="f11">Fútbol 11</option>
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.24em] text-[#7fffb5]">Superficie</label>
        <select value={surface} onChange={(event) => onChange({ surface: event.target.value })} className="mt-2 w-full rounded-3xl border border-white/10 bg-[#0e150e]/90 px-4 py-3 text-sm text-white outline-none transition focus:border-[#4be176]/40">
          <option value="">Cualquiera</option>
          <option value="synthetic">Sintética</option>
          <option value="grass">Césped natural</option>
          <option value="turf">Turf</option>
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.24em] text-[#7fffb5]">Amenidades</label>
        <div className="mt-3 grid gap-2">
          {[
            { label: "Iluminación LED", value: "lighting" },
            { label: "Vestuario", value: "locker_room" },
            { label: "Parking", value: "parking" },
          ].map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange({ amenity: option.value })}
              className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${amenities.includes(option.value) ? "border-[#4be176] bg-[#4be176]/15 text-white" : "border-white/10 bg-white/5 text-[#dce5d9]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.24em] text-[#7fffb5]">Precio por hora</label>
        <div className="mt-3 flex items-center gap-3 text-sm text-white">
          <input
            type="number"
            value={priceRange[0]}
            min={0}
            onChange={(event) => onChange({ priceRange: [Number(event.target.value), priceRange[1]] })}
            className="w-full rounded-3xl border border-white/10 bg-[#0e150e]/90 px-4 py-3 text-sm text-white outline-none"
            placeholder="Mínimo"
          />
          <input
            type="number"
            value={priceRange[1]}
            min={0}
            onChange={(event) => onChange({ priceRange: [priceRange[0], Number(event.target.value)] })}
            className="w-full rounded-3xl border border-white/10 bg-[#0e150e]/90 px-4 py-3 text-sm text-white outline-none"
            placeholder="Máximo"
          />
        </div>
      </div>
    </div>
  );
}
