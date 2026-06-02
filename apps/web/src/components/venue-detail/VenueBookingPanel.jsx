"use client";

export default function VenueBookingPanel({ selectedSlot, pricePerHour, onCheckout, loading }) {
  const subtotal = selectedSlot ? pricePerHour : 0;
  const total = subtotal;

  return (
    <aside className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-6 shadow-[0_25px_75px_-55px_rgba(0,255,147,0.18)]">
      <div className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#7fffb5]">Finalizar reserva</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Selección rápida</h2>
        </div>
        <div className="rounded-[1.75rem] bg-black/40 p-5">
          <div className="flex items-center justify-between text-sm text-[#c5d9c4]">
            <span>Horario elegido</span>
            <span>{selectedSlot ?? "Sin horario"}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-[#c5d9c4]">
            <span>Precio por hora</span>
            <span>${pricePerHour.toFixed(2)}</span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-4 text-sm text-[#c5d9c4]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between font-semibold text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={!selectedSlot || loading}
          onClick={onCheckout}
          className="w-full rounded-3xl bg-[#4be176] px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-[#6dfc95] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Procesando..." : selectedSlot ? "Reservar ahora" : "Selecciona un horario"}
        </button>
      </div>
    </aside>
  );
}
