import { Suspense } from "react";
import Link from "next/link";
import { Users, Droplets, Star } from "lucide-react";
import type { PitchCard, PitchApiType, PitchSize } from "@/types/search";
import { fetchFromApi } from "@/lib/api/server-fetch";
import SessionGuard from "./_components/SessionGuard";
import InicioSearchBox from "./_components/InicioSearchBox";
import InicioFiltersPanel from "./_components/InicioFiltersPanel";
import InicioSortSelect from "./_components/InicioSortSelect";
import PitchesDebugButton from "./_components/PitchesDebugButton";
import NoResultsState from "./_components/NoResultsState";
import { PublicShell } from "./_components/PublicShell";

// ── Search params typing ───────────────────────────────────────────────────────
// Next.js 14: searchParams is a synchronous object
// Next.js 15: wrap type in Promise<...> and add `await searchParams` below
interface PageSearchParams {
  zone?: string;
  turf_type?: string;
  min_price?: string;
  max_price?: string;
  sizes?: string | string[];
  surfaces?: string | string[];
  sort?: string;
  page?: string;
}

// Normalise a param that could be a single string or an array
function asArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// Build a "load more" URL preserving all current params and incrementing page
function buildPageUrl(searchParams: PageSearchParams, pageNum: number): string {
  const params = new URLSearchParams();
  if (searchParams.zone)      params.set("zone",      searchParams.zone);
  if (searchParams.turf_type) params.set("turf_type", searchParams.turf_type);
  if (searchParams.min_price) params.set("min_price", searchParams.min_price);
  if (searchParams.max_price) params.set("max_price", searchParams.max_price);
  if (searchParams.sort)      params.set("sort",      searchParams.sort);
  asArray(searchParams.sizes).forEach((s) => params.append("sizes", s));
  asArray(searchParams.surfaces).forEach((s) => params.append("surfaces", s));
  params.set("page", String(pageNum));
  return `/inicio?${params.toString()}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  // Next.js 15 requires awaiting searchParams before accessing properties
  const params = await searchParams;

  const sizes       = asArray(params.sizes)    as PitchSize[];
  const surfaces    = asArray(params.surfaces);
  const currentPage = Number(params.page ?? 1);

  // ── Fetch via .NET API (proxy) ───────────────────────────────────────────
  // GetAllPitchesQuery acepta: VenueId, Type, Surface, PageNumber, PageSize
  const apiParams = new URLSearchParams();

  // Surface: viene del SearchBox (turf_type) O del FilterPanel (surfaces)
  // Se da prioridad al FilterPanel si tiene algo seleccionado
  const surfaceValue = surfaces.length > 0 ? surfaces[0] : (params.turf_type ?? "");
  if (surfaceValue) apiParams.set("Surface", surfaceValue);

  // Type: viene del FilterPanel (sizes) — primer valor seleccionado
  if (sizes.length > 0) apiParams.set("Type", sizes[0]);

  // Paginación
  apiParams.set("PageNumber", String(currentPage));
  apiParams.set("PageSize",   "20"); // traemos más para poder filtrar por nombre client-side

  // Nota: filtro por nombre (zone) se aplica client-side ya que la API no tiene
  // búsqueda por texto aún. min_price / max_price igual.
  const nameFilter     = (params.zone      ?? "").toLowerCase().trim();
  const minPriceFilter = params.min_price ? Number(params.min_price) : null;
  const maxPriceFilter = params.max_price ? Number(params.max_price) : null;

  type ApiPitch = {
    id: string;
    name: string;
    venueId: string;
    venueName: string;
    type: PitchApiType;
    surface: string;
    pricePerHour: number;
    isActive: boolean;
  };

  type ApiResponse = {
    items: ApiPitch[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };

  let pitches: PitchCard[] = [];
  let total = 0;
  let hasMore = false;
  let fetchError: string | null = null;

  try {
    const data = await fetchFromApi<ApiResponse | ApiPitch[]>(
      `/Pitches?${apiParams.toString()}`
    );

    if (Array.isArray(data)) {
      pitches = (data as ApiPitch[]).map(apiPitchToPitchCard);
    } else {
      const paged = data as ApiResponse;
      pitches  = (paged.items ?? []).map(apiPitchToPitchCard);
      hasMore  = paged.pageNumber < paged.totalPages;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Error al cargar las canchas";
    console.warn("[InicioPage] fetchFromApi error (handled):", err);
  }

  // ── Filtros client-side (lo que la API no soporta aún) ───────────────────
  if (nameFilter) {
    pitches = pitches.filter((p) =>
      p.name.toLowerCase().includes(nameFilter) ||
      p.venueName.toLowerCase().includes(nameFilter)
    );
  }
  if (minPriceFilter !== null) {
    pitches = pitches.filter((p) => p.pricePerHour >= minPriceFilter!);
  }
  if (maxPriceFilter !== null) {
    pitches = pitches.filter((p) => p.pricePerHour <= maxPriceFilter!);
  }
  total = pitches.length;


  // Pass resolved params to child helpers
  const resolvedParams = params;

  return (
    <PublicShell>

      {/* Client-only auth session guard — renders null */}
      <Suspense fallback={null}>
        <SessionGuard />
      </Suspense>

      {/* 🔍 Debug button — DEV ONLY: remover antes de producción */}
      {process.env.NODE_ENV === "development" && <PitchesDebugButton />}

      <div className="py-10 px-4 sm:px-8 max-w-6xl mx-auto">

        {/* Hero Header */}
        <header className="mb-12 relative z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#22d3ee]/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -top-12 right-0 w-72 h-72 rounded-full bg-gradient-to-bl from-[#3b82f6]/15 to-transparent blur-3xl pointer-events-none" />

          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            Encuentra tu próximo <span className="text-[#4be176]">picadito</span>.
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl mb-10">
            Reserva las mejores canchas de la ciudad con un solo clic. Calidad profesional
            para tus partidos de entre semana.
          </p>

          {/* Search Box — Client Component (needs useSearchParams) */}
          <Suspense fallback={<SearchBoxSkeleton />}>
            <InicioSearchBox
              defaultZone={params.zone ?? ""}
              defaultTurfType={params.turf_type ?? ""}
              defaultMinPrice={params.min_price ?? ""}
              defaultMaxPrice={params.max_price ?? ""}
            />
          </Suspense>
        </header>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Filters Sidebar — Client Component */}
          <Suspense fallback={<FiltersSkeleton />}>
            <InicioFiltersPanel />
          </Suspense>

          {/* Results — Server Rendered */}
          <section className="lg:col-span-9 space-y-6">

            {/* Results header */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-[#8b949e]">
                <span className="text-white font-bold">{total}</span>{" "}
                canchas disponibles cerca de ti
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#4be176]">Ordenar por:</span>
                <Suspense fallback={null}>
                  <InicioSortSelect defaultSort={params.sort ?? "rating"} />
                </Suspense>
              </div>
            </div>

            {/* ── Validation error: filter value not supported by API ── */}
            {fetchError && isValidationError(fetchError) && (
              <NoResultsState
                reason="validation"
                appliedFilter={activeFilterLabel(params)}
                errorDetail={fetchError}
              />
            )}

            {/* ── Generic server error ── */}
            {fetchError && !isValidationError(fetchError) && (
              <NoResultsState
                reason="error"
                errorDetail={fetchError}
              />
            )}

            {/* ── Empty state: no results for this filter combination ── */}
            {!fetchError && pitches.length === 0 && (
              <NoResultsState
                reason="filters"
                appliedFilter={activeFilterLabel(params)}
              />
            )}

            {/* ── Pitch Cards ── */}
            {pitches.map((pitch) => (
              <PitchCardItem key={pitch.id} pitch={pitch} />
            ))}

            {/* ── Pagination / Load More ── */}
            {hasMore && (
              <div className="py-8 flex justify-center">
                <Link
                  href={buildPageUrl(resolvedParams, currentPage + 1)}
                  className="flex items-center gap-2 text-[#8b949e] font-bold uppercase hover:text-[#4be176] transition-colors"
                >
                  ↓ Cargar más canchas
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-8 flex flex-col md:flex-row justify-between items-center border-t border-[#1e3a5f] bg-[#071b28] mt-10">
        <div className="flex flex-col items-center md:items-start gap-2 mb-6 md:mb-0">
          <span className="text-sm font-bold text-white">Picadito</span>
          <p className="text-xs text-[#4be176] max-w-xs text-center md:text-left uppercase tracking-widest leading-loose">
            © 2024 Picadito by TriaSoft. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="text-xs text-[#4be176] hover:text-[#22d3ee] transition-colors uppercase font-bold">Privacy</a>
          <a href="#" className="text-xs text-[#4be176] hover:text-[#22d3ee] transition-colors uppercase font-bold">Terms</a>
          <a href="#" className="text-xs text-[#4be176] hover:text-[#22d3ee] transition-colors uppercase font-bold">Support</a>
        </div>
      </footer>
    </PublicShell>
  );
}

// ── Error classification helpers ──────────────────────────────────────────────

/**
 * Returns true if the error message is a .NET FluentValidation / ProblemDetails
 * 400 response (e.g. "One or more validation errors occurred.").
 * These errors indicate that the filter value sent is not accepted by the API yet
 * (e.g. a surface type like "natural" that the validator doesn't know about).
 */
function isValidationError(message: string): boolean {
  return (
    message.toLowerCase().includes("validation") ||
    message.toLowerCase().includes("one or more") ||
    message.toLowerCase().includes("no es válid") ||
    message.toLowerCase().includes("no válid")
  );
}

/**
 * Builds a human-readable label for the currently active filter,
 * used in the NoResultsState message so the user sees what they searched for.
 */
function activeFilterLabel(params: PageSearchParams): string | undefined {
  const SURFACE_LABELS: Record<string, string> = {
    natural:   "Césped Natural",
    sintetico: "Sintética",
    cemento:   "Cemento",
  };
  const TYPE_LABELS: Record<string, string> = {
    FiveV5:    "Fútbol 5",
    SevenV7:   "Fútbol 7",
    NineV9:    "Fútbol 9",
    ElevenV11: "Fútbol 11",
  };

  const surfaces = asArray(params.surfaces);
  const sizes    = asArray(params.sizes);

  if (params.zone?.trim())           return params.zone.trim();
  if (surfaces.length > 0)           return SURFACE_LABELS[surfaces[0]] ?? surfaces[0];
  if (params.turf_type)              return SURFACE_LABELS[params.turf_type] ?? params.turf_type;
  if (sizes.length > 0)              return TYPE_LABELS[sizes[0]] ?? sizes[0];
  if (params.min_price || params.max_price) {
    const min = params.min_price ? `$${params.min_price}` : "";
    const max = params.max_price ? `$${params.max_price}` : "";
    return min && max ? `${min} – ${max}` : min || max;
  }
  return undefined;
}

// ── API mapper ────────────────────────────────────────────────────────────────

/** Formatea un número como moneda local argentina. */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convierte un PitchDto de la .NET API al shape PitchCard que usa la UI.
 * La API devuelve camelCase (pricePerHour, venueId, etc.)
 */
function apiPitchToPitchCard(dto: {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  type: PitchApiType;
  surface: string;
  pricePerHour: number;
  isActive: boolean;
}): PitchCard {
  return {
    id:             dto.id,
    name:           dto.name,
    venueId:        dto.venueId,
    venueName:      dto.venueName,
    type:           dto.type,
    surface:        dto.surface as PitchCard["surface"],
    pricePerHour:   dto.pricePerHour,
    priceFormatted: formatCurrency(dto.pricePerHour),
    isActive:       dto.isActive,
  };
}

// ── Pitch image pool (local assets — no external URLs) ────────────────────────

const PITCH_IMAGES = [
  "/pitches/pitch-1.png",
  "/pitches/pitch-2.png",
  "/pitches/pitch-3.png",
];

/** Selects a deterministic image from the pool based on the pitch id. */
function getPitchImage(id: string): string {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PITCH_IMAGES[hash % PITCH_IMAGES.length];
}

// ── Label helpers ─────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PitchApiType, string> = {
  FiveV5:    "Fútbol 5",
  SevenV7:   "Fútbol 7",
  NineV9:    "Fútbol 9",
  ElevenV11: "Fútbol 11",
};

const SURFACE_BADGE: Record<string, string> = {
  natural:   "Natural",
  sintetico: "Sintética",
  cemento:   "Cemento",
};

// ── Pitch card — layout matches mockup: image left / content right ─────────────

function PitchCardItem({ pitch }: { pitch: PitchCard }) {
  const typeLabel    = TYPE_LABELS[pitch.type]    ?? pitch.type;
  const surfaceLabel = SURFACE_BADGE[pitch.surface] ?? pitch.surface;
  const imgSrc       = getPitchImage(pitch.id);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#1e3a5f] bg-[#0d1117] shadow-lg flex flex-col md:flex-row hover:border-[#4be176]/40 hover:shadow-[#4be176]/10 hover:shadow-xl transition-all duration-300">

      {/* ── Left: thumbnail ── */}
      <div className="relative md:w-64 lg:w-72 h-52 md:h-auto flex-shrink-0 overflow-hidden">
        <img
          src={imgSrc}
          alt={`Cancha ${pitch.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/50 md:bg-gradient-to-t md:from-black/60 md:via-transparent md:to-transparent" />

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {pitch.isActive && (
            <span className="bg-[#4be176] text-[#0d1117] text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Disponible hoy
            </span>
          )}
          <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border border-white/10">
            {surfaceLabel}
          </span>
        </div>
      </div>

      {/* ── Right: content ── */}
      <div className="flex-1 p-6 flex flex-col justify-between gap-4 min-w-0">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{pitch.venueName}</h3>
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{pitch.name}</p>
          </div>
          {/* Star rating placeholder — no rating in API yet */}
          <div className="shrink-0 flex items-center gap-1 text-sm font-bold text-white">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>—</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#4be176]" />
            {typeLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4 text-[#4be176]" />
            {surfaceLabel}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-[#1e3a5f] pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#4be176] mb-0.5">
              Precio por hora
            </p>
            <p className="text-2xl font-black text-white">{pitch.priceFormatted}</p>
          </div>

          <Link
            href={`/inicio/cancha/${pitch.id}`}
            className="shrink-0 bg-[#4be176] text-[#0d1117] px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#3dd168] active:scale-95 transition-all shadow-lg shadow-[#4be176]/20"
          >
            Ver disponibilidad
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Skeleton fallbacks ────────────────────────────────────────────────────────

function SearchBoxSkeleton() {
  return (
    <div className="bg-[#161b22]/80 rounded-xl p-4 border border-[#22d3ee]/20 h-[72px] animate-pulse" />
  );
}

function FiltersSkeleton() {
  return (
    <aside className="lg:col-span-3">
      <div className="bg-[#161b22] rounded-xl p-6 border border-[#1e3a5f] h-64 animate-pulse" />
    </aside>
  );
}
