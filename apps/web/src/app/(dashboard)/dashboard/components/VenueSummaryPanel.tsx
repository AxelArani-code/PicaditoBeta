import { ExternalLink, MapPin, Pencil } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";
import type { BookingAnalytics, VenueOption } from "./types";
import { formatPrice } from "@/services/bookings.service";

type VenueSummaryPanelProps = {
  selectedVenue: string;
  venueOptions: VenueOption[];
  kpis: BookingAnalytics;
  getVenueLabel: (value: string) => string;
  onVenueChange: (value: string) => void;
};

export function VenueSummaryPanel({
  selectedVenue,
  venueOptions,
  kpis,
  getVenueLabel,
  onVenueChange,
}: VenueSummaryPanelProps) {
  return (
    <DashboardPanel className="overflow-hidden p-5 lg:col-span-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4be176]">
            Complejo activo
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{getVenueLabel(selectedVenue)}</h2>
          <p className="mt-2 text-sm text-[#9fb3c5]">
            Monitorea canchas, ocupacion e ingresos desde una sola vista.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[#244257] bg-[#071521] p-2 text-[#9fb3c5] transition hover:border-[#4be176]/60 hover:text-white">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-[#244257] bg-[#071521] p-2 text-[#9fb3c5] transition hover:border-[#4be176]/60 hover:text-white">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#244257] bg-[#071521]/70 p-4">
        <label className="text-xs font-semibold text-[#9fb3c5]">Sede seleccionada</label>
        <div className="mt-2 flex items-center gap-3">
          <MapPin className="h-4 w-4 text-[#4be176]" />
          <select
            value={selectedVenue}
            onChange={(event) => onVenueChange(event.target.value)}
            className="w-full bg-transparent text-lg font-bold text-white outline-none"
          >
            {venueOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#102436]">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryItem label="Canchas" value="12" />
        <SummaryItem label="Ocupacion" value={`${kpis.occupancyRate}%`} accent />
        <SummaryItem label="Reservas" value={String(kpis.totalReservations)} />
        <SummaryItem label="Ingresos" value={formatPrice(kpis.totalIncome)} />
      </div>
    </DashboardPanel>
  );
}

function SummaryItem({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#244257] bg-[#071521]/70 p-4">
      <p className="text-xs text-[#9fb3c5]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent ? "text-[#4be176]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
