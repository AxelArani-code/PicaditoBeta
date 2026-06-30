"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Pitch sizes — must match the `type` column values in Supabase.
 * API returns: "FiveV5" | "SevenV7" | "NineV9" | "ElevenV11"
 */
const PITCH_SIZES = [
  { value: "FiveV5",    label: "Fútbol 5" },
  { value: "SevenV7",   label: "Fútbol 7" },
  { value: "NineV9",    label: "Fútbol 9" },
  { value: "ElevenV11", label: "Fútbol 11" },
];

/**
 * Surfaces — must match the `surface` column values in Supabase.
 */
const SURFACES = [
  { value: "sintetico", label: "Sintética" },
  { value: "natural",   label: "Césped Natural" },
  { value: "cemento",   label: "Cemento" },
];

/**
 * Sidebar de filtros interactivo.
 * Cada cambio de checkbox actualiza los URL params, disparando un re-render
 * del Server Component con los nuevos filtros aplicados.
 */
export default function InicioFiltersPanel() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const activeSizes    = searchParams.getAll("sizes");
  const activeSurfaces = searchParams.getAll("surfaces");

  const toggleParam = (key: "sizes" | "surfaces", value: string) => {
    const params  = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);

    params.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...current, value].forEach((v) => params.append(key, v));
    }

    params.delete("page");
    router.push(`/inicio?${params.toString()}`);
  };

  return (
    <aside className="lg:col-span-3 space-y-6">
      {/* Filter box */}
      <div className="bg-[#161b22] backdrop-blur-xl rounded-2xl p-6 border border-[#1e3a5f]">
        <h3 className="text-base font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
          <span className="text-lg">⚙️</span> Filtros
        </h3>

        <div className="space-y-7">
          {/* Pitch sizes */}
          <div>
            <span className="text-[10px] font-black text-[#4be176] block mb-3 uppercase tracking-[0.2em]">
              Tamaño de Cancha
            </span>
            <div className="space-y-2.5">
              {PITCH_SIZES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`size-${value}`}
                      className="peer sr-only"
                      checked={activeSizes.includes(value)}
                      onChange={() => toggleParam("sizes", value)}
                    />
                    <div className="w-4 h-4 rounded border border-[#1e3a5f] bg-[#0d1117] peer-checked:bg-[#4be176] peer-checked:border-[#4be176] transition-colors flex items-center justify-center">
                      {activeSizes.includes(value) && (
                        <svg className="w-2.5 h-2.5 text-[#0d1117]" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${activeSizes.includes(value) ? "text-white font-semibold" : "text-slate-500 group-hover:text-white"}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Surface type */}
          <div>
            <span className="text-[10px] font-black text-[#4be176] block mb-3 uppercase tracking-[0.2em]">
              Superficie
            </span>
            <div className="space-y-2.5">
              {SURFACES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`surface-${value}`}
                      className="peer sr-only"
                      checked={activeSurfaces.includes(value)}
                      onChange={() => toggleParam("surfaces", value)}
                    />
                    <div className="w-4 h-4 rounded border border-[#1e3a5f] bg-[#0d1117] peer-checked:bg-[#4be176] peer-checked:border-[#4be176] transition-colors flex items-center justify-center">
                      {activeSurfaces.includes(value) && (
                        <svg className="w-2.5 h-2.5 text-[#0d1117]" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm transition-colors ${activeSurfaces.includes(value) ? "text-white font-semibold" : "text-slate-500 group-hover:text-white"}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters summary + clear */}
        {(activeSizes.length > 0 || activeSurfaces.length > 0) && (
          <button
            onClick={() => router.push("/inicio")}
            className="mt-6 w-full text-xs text-slate-500 hover:text-[#4be176] transition-colors border border-[#1e3a5f] hover:border-[#4be176]/30 rounded-lg py-2 font-semibold"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Featured promo card (static) */}
      <div className="rounded-2xl overflow-hidden relative group aspect-[3/4] border border-[#1e3a5f] bg-gradient-to-br from-[#0d1117] to-[#1e3a5f]">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src="/pitches/pitch-2.png"
          alt="Torneos"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/50 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <span className="bg-[#4be176] text-[#0d1117] px-3 py-1 rounded text-xs font-black uppercase tracking-widest mb-3 inline-block">
            Pro Edition
          </span>
          <h4 className="text-xl font-bold text-white mb-1">Torneos Mensuales</h4>
          <p className="text-sm text-slate-400 mb-4">
            Únete a la liga de élite y compite por premios reales.
          </p>
          <a
            href="/dashboard"
            className="text-[#4be176] font-bold border-b border-[#4be176] pb-0.5 text-sm inline-block hover:text-white hover:border-white transition-colors"
          >
            Ver más →
          </a>
        </div>
      </div>
    </aside>
  );
}
