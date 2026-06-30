"use client";

import { useState } from "react";
import { getPitches } from "@/services/pitches.service";

type Status = "idle" | "loading" | "ok" | "error";

/**
 * Botón flotante de debug — solo para desarrollo.
 * Llama a /api/proxy/pitches, loguea el JSON crudo en la consola
 * y muestra un feedback visual en pantalla.
 *
 * Remover (o envolver en `process.env.NODE_ENV === "development"`) antes de producción.
 */
export default function PitchesDebugButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState<string | null>(null);

  async function handleClick() {
    setStatus("loading");
    setSummary(null);

    try {
      const data = await getPitches({});

      // ── Log completo en consola ──────────────────────────────────────────
      console.group("🔍 [DEBUG] getPitches — JSON completo");
      console.log("URL llamada: /api/proxy/pitches");
      console.log("Cantidad de items:", Array.isArray(data) ? data.length : data?.items?.length ?? "?");
      console.log("Estructura completa:", data);
      if (Array.isArray(data) && data.length > 0) {
        console.log("Primer item (ejemplo de shape):", data[0]);
      } else if (data?.items?.length > 0) {
        console.log("Primer item (ejemplo de shape):", data.items[0]);
      }
      console.groupEnd();

      const count = Array.isArray(data)
        ? data.length
        : data?.items?.length ?? data?.totalCount ?? "?";

      setSummary(`${count} pitches recibidos — revisá la consola (F12)`);
      setStatus("ok");
    } catch (err) {
      console.error("❌ [DEBUG] getPitches falló:", err);
      setSummary(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  const colors: Record<Status, string> = {
    idle:    "bg-[#4be176] text-[#0d1117] hover:bg-[#3dd168]",
    loading: "bg-amber-400 text-[#0d1117] cursor-wait",
    ok:      "bg-emerald-500 text-white",
    error:   "bg-red-500 text-white",
  };

  const labels: Record<Status, string> = {
    idle:    "⚽ Test getPitches",
    loading: "Cargando...",
    ok:      "✅ OK — ver consola",
    error:   "❌ Error",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Tooltip con resultado */}
      {summary && (
        <div
          className={`max-w-xs rounded-xl px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md border ${
            status === "error"
              ? "bg-red-900/80 border-red-500/40 text-red-200"
              : "bg-[#161b22]/90 border-[#4be176]/30 text-[#4be176]"
          }`}
        >
          {summary}
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`
          flex items-center gap-2 rounded-full px-5 py-3
          text-sm font-bold shadow-2xl shadow-black/40
          transition-all duration-200 active:scale-95
          border border-white/10
          ${colors[status]}
        `}
      >
        {status === "loading" && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {labels[status]}
      </button>

      {/* Etiqueta DEV */}
      <span className="text-[10px] uppercase tracking-widest text-slate-600 pr-1">
        DEV ONLY
      </span>
    </div>
  );
}
