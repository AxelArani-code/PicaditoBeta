"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, DollarSign, Layers } from "lucide-react";

interface InicioSearchBoxProps {
  defaultZone?: string;
  defaultTurfType?: string;
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
}

const SURFACES = [
  { value: "",          label: "Todas las superficies" },
  { value: "sintetico", label: "Sintética" },
  { value: "natural",   label: "Césped Natural" },
  { value: "cemento",   label: "Cemento" },
];

const BUDGET_PRESETS = [
  { label: "Cualquier precio",  min: "",   max: ""    },
  { label: "Hasta $50",         min: "",   max: "50"  },
  { label: "$50 – $100",        min: "50", max: "100" },
  { label: "Más de $100",       min: "100", max: ""   },
];

/**
 * Barra de búsqueda interactiva.
 * Al hacer "Buscar" actualiza los URL search params, lo que dispara
 * el re-render del Server Component con nuevos filtros.
 */
export default function InicioSearchBox({
  defaultZone     = "",
  defaultTurfType = "",
  defaultMinPrice = "",
  defaultMaxPrice = "",
}: InicioSearchBoxProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [zone,     setZone]     = useState(defaultZone);
  const [surface,  setSurface]  = useState(defaultTurfType);
  const [minPrice, setMinPrice] = useState(defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    zone.trim()
      ? params.set("zone",       zone.trim())
      : params.delete("zone");

    surface
      ? params.set("turf_type",  surface)
      : params.delete("turf_type");

    minPrice
      ? params.set("min_price",  minPrice)
      : params.delete("min_price");

    maxPrice
      ? params.set("max_price",  maxPrice)
      : params.delete("max_price");

    params.delete("page");
    router.push(`/inicio?${params.toString()}`);
  };

  // Budget label for display
  const budgetLabel =
    minPrice && maxPrice ? `$${minPrice} – $${maxPrice}` :
    minPrice             ? `Desde $${minPrice}` :
    maxPrice             ? `Hasta $${maxPrice}` :
    "";

  const [budgetOpen, setBudgetOpen] = useState(false);

  const selectBudget = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setBudgetOpen(false);
  };

  return (
    <div className="relative bg-[#0d1117]/90 backdrop-blur-xl rounded-2xl border border-[#1e3a5f] shadow-2xl shadow-black/40 overflow-visible">
      <div className="flex flex-col md:flex-row">

        {/* ── Ubicación ── */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#1e3a5f] focus-within:bg-[#161b22]/60 transition-colors group">
          <MapPin className="h-5 w-5 text-[#4be176] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-[#4be176] uppercase tracking-[0.2em]">Nombre de cancha</span>
            <input
              id="search-zone"
              className="bg-transparent border-none p-0 text-white placeholder:text-slate-600 focus:ring-0 text-sm w-full"
              placeholder="Buscar cancha..."
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* ── Tipo de Grama ── */}
        <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#1e3a5f] focus-within:bg-[#161b22]/60 transition-colors">
          <Layers className="h-5 w-5 text-[#4be176] shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[10px] font-black text-[#4be176] uppercase tracking-[0.2em]">Tipo de Grama</span>
            <select
              id="search-surface"
              className="bg-transparent border-none p-0 text-white focus:ring-0 text-sm appearance-none cursor-pointer w-full"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            >
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#161b22]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Presupuesto ── */}
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={() => setBudgetOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#161b22]/60 transition-colors text-left"
          >
            <DollarSign className="h-5 w-5 text-[#4be176] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-[#4be176] uppercase tracking-[0.2em]">Presupuesto</span>
              <span className={`text-sm ${budgetLabel ? "text-white" : "text-slate-600"}`}>
                {budgetLabel || "Rango de precio"}
              </span>
            </div>
          </button>

          {/* Budget dropdown */}
          {budgetOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#1e3a5f] rounded-xl shadow-2xl z-[200] overflow-hidden">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => selectBudget(p.min, p.max)}
                  className="w-full text-left px-5 py-3 text-sm text-slate-300 hover:bg-[#1e3a5f]/60 hover:text-white transition-colors border-b border-[#1e3a5f]/50 last:border-0"
                >
                  {p.label}
                </button>
              ))}
              {/* Custom range */}
              <div className="px-5 py-3 border-t border-[#1e3a5f]/50">
                <p className="text-[10px] text-[#4be176] font-bold uppercase tracking-wider mb-2">Rango personalizado</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Desde"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-[#4be176] focus:ring-0 focus:outline-none"
                  />
                  <span className="text-slate-600 text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-[#4be176] focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setBudgetOpen(false)}
                    className="shrink-0 bg-[#4be176]/20 text-[#4be176] rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-[#4be176]/30 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Buscar button ── */}
        <button
          id="inicio-search-btn"
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-[#4be176] text-[#0d1117] px-8 py-4 md:rounded-r-2xl font-black text-sm uppercase tracking-wider hover:bg-[#3dd168] active:scale-[0.97] transition-all shadow-lg shadow-[#4be176]/20 border-t md:border-t-0 border-[#4be176]/20"
        >
          <Search className="h-5 w-5" />
          Buscar
        </button>
      </div>
    </div>
  );
}
