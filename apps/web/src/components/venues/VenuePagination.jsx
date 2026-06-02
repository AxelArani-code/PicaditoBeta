"use client";

export default function VenuePagination({ pageNumber, totalPages, onPrev, onNext }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#bccbb9]">Página {pageNumber} de {totalPages}</p>
      <div className="flex items-center gap-3">
        <button onClick={onPrev} disabled={pageNumber <= 1} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-50">
          Anterior
        </button>
        <button onClick={onNext} disabled={pageNumber >= totalPages} className="rounded-3xl border border-[#4be176]/30 bg-[#4be176]/10 px-4 py-3 text-sm font-semibold text-[#dce5d9] transition disabled:cursor-not-allowed disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </div>
  );
}
