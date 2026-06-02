"use client";

export default function VenueEmptyState({ title = "No hay complejos disponibles", message = "Ajusta los filtros o intenta otra búsqueda para ver más resultados." }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#08110a]/90 p-10 text-center text-[#bccbb9]">
      <p className="text-sm uppercase tracking-[0.28em] text-[#7fffb5]">Sin resultados</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-xl mx-auto text-sm leading-7">{message}</p>
    </div>
  );
}
