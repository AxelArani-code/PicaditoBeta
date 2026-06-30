import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";

export function ReviewPanel() {
  return (
    <DashboardPanel className="p-5 border-[#1d3b52] bg-[#102a40]/90">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Cosas para revisar</h2>
        <span className="text-xs font-bold text-[#ffd05a]">4</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 rounded-xl border border-[#1d3b52] bg-[#071521]/40 p-4">
          <AlertTriangle className="h-4 w-4 text-[#ffd05a] shrink-0" />
          <p className="text-[13px] font-medium text-[#d7e8f2]">3 reservas pendientes de confirmación.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#1d3b52] bg-[#071521]/40 p-4">
          <AlertTriangle className="h-4 w-4 text-[#ffd05a] shrink-0" />
          <p className="text-[13px] font-medium text-[#d7e8f2]">Cancha 2 tiene horarios sin precio configurado.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#1d3b52] bg-[#071521]/40 p-4">
          <AlertCircle className="h-4 w-4 text-[#ff6b6b] shrink-0" />
          <p className="text-[13px] font-medium text-[#d7e8f2]">Tenés 1 reclamo nuevo por revisar.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[#1d3b52] bg-[#071521]/40 p-4">
          <Clock className="h-4 w-4 text-[#67a6d8] shrink-0" />
          <p className="text-[13px] font-medium text-[#d7e8f2]">Recordá actualizar la disponibilidad del fin de semana.</p>
        </div>
      </div>
    </DashboardPanel>
  );
}
