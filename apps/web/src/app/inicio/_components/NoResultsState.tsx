"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, SlidersHorizontal, RotateCcw } from "lucide-react";

interface NoResultsStateProps {
  /** Indicates the cause: "filters" = no matches, "validation" = unsupported filter value */
  reason?: "filters" | "validation" | "error";
  /** Human-readable description of what filter was applied, e.g. "Césped Natural" */
  appliedFilter?: string;
  /** Technical error message (only shown in dev mode for validation/error cases) */
  errorDetail?: string;
}

/**
 * Friendly empty-state shown when a filter combination yields no results
 * or when the API rejects a filter value (e.g. surface type not yet supported).
 */
export default function NoResultsState({
  reason = "filters",
  appliedFilter,
  errorDetail,
}: NoResultsStateProps) {
  const router = useRouter();

  const isValidationOrError = reason === "validation" || reason === "error";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#4be176]/10 blur-2xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#1e3a5f] bg-[#0d1117]">
          {isValidationOrError ? (
            <SlidersHorizontal className="h-9 w-9 text-[#4be176]" strokeWidth={1.5} />
          ) : (
            <SearchX className="h-9 w-9 text-[#4be176]" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-black text-white mb-3">
        {isValidationOrError
          ? "Este tipo de cancha aún no está disponible"
          : "Sin resultados para tu búsqueda"}
      </h2>

      {/* Description */}
      <p className="text-[#8b949e] text-sm max-w-sm leading-relaxed mb-2">
        {isValidationOrError ? (
          <>
            {appliedFilter ? (
              <>
                Las canchas de tipo{" "}
                <span className="text-white font-semibold">"{appliedFilter}"</span>{" "}
                no están cargadas en el sistema todavía.
              </>
            ) : (
              "El filtro que aplicaste no tiene canchas disponibles en el sistema todavía."
            )}
            <br />
            Probá con otra superficie o tipo de cancha.
          </>
        ) : (
          <>
            No encontramos canchas que coincidan con tu búsqueda
            {appliedFilter && (
              <>
                {" "}para{" "}
                <span className="text-white font-semibold">"{appliedFilter}"</span>
              </>
            )}
            . Intentá ajustar los filtros.
          </>
        )}
      </p>

      {/* Dev-mode detail */}
      {process.env.NODE_ENV === "development" && errorDetail && (
        <p className="text-[#4a6280] text-xs mt-1 mb-4 font-mono">
          ⚠ {errorDetail}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
        <button
          onClick={() => router.push("/inicio")}
          className="flex items-center gap-2 rounded-xl bg-[#4be176] text-[#0d1117] px-6 py-2.5 text-sm font-black uppercase tracking-wide hover:bg-[#3dd168] active:scale-[0.97] transition-all"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
          Limpiar filtros
        </button>
        <Link
          href="/torneos"
          className="flex items-center gap-2 rounded-xl border border-[#1e3a5f] bg-[#0d1117] text-[#8b949e] px-6 py-2.5 text-sm font-semibold hover:border-[#4be176]/30 hover:text-white transition-all"
        >
          Ver torneos disponibles
        </Link>
      </div>
    </div>
  );
}
