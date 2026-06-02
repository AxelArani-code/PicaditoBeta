"use client";

export default function VenueSlotGrid({ slots, selectedSlot, onSelect }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-6 shadow-[0_22px_55px_-35px_rgba(0,255,147,0.16)]">
      <div>
        <h3 className="text-xl font-semibold text-white">Horarios disponibles</h3>
        <p className="mt-2 text-sm text-[#c5d9c4]">
          Elige tu franja para reservar y completa la compra en el siguiente paso.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => {
          const active = selectedSlot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className={`rounded-[1.75rem] border px-4 py-4 text-left transition ${
                active
                  ? "border-[#4be176] bg-[#4be176]/10 text-white shadow-[0_12px_40px_-24px_rgba(75,225,118,0.55)]"
                  : "border-white/10 bg-black/40 text-[#c5d9c4] hover:border-[#4be176]/40 hover:bg-white/5"
              }`}
            >
              <span className="block text-sm font-semibold">{slot}</span>
              <span className="mt-2 block text-xs text-[#94f7c2]/80">1 hora</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
