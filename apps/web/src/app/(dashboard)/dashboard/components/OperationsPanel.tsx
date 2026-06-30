import { Building2, Grid3x3, UserPlus } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";

export function OperationsPanel() {
  const actions = [
    { label: "Crear complejo", icon: Building2 },
    { label: "Agregar cancha", icon: Grid3x3 },
    { label: "Asignar encargado", icon: UserPlus },
  ];

  return (
    <div className="space-y-4 lg:col-span-4">
      <DashboardPanel className="p-5">
        <h3 className="text-lg font-black text-white">Acciones rapidas</h3>
        <div className="mt-4 space-y-2">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#244257] bg-[#071521]/70 p-3 text-left text-sm font-semibold text-[#d7e8f2] transition hover:border-[#4be176]/60 hover:bg-[#0b1b28]"
            >
              <Icon className="h-4 w-4 text-[#4be176]" />
              {label}
            </button>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#9fb3c5]">
            Estructura
          </h3>
          <Grid3x3 className="h-4 w-4 text-[#67a6d8]" />
        </div>
        <ul className="mt-5 space-y-3 text-sm text-[#d7e8f2]">
          <li className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#4be176]" />
            Propiedad principal
          </li>
          <li className="ml-4 border-l border-[#244257] pl-4 text-[#9fb3c5]">
            Sede Norte
          </li>
          <li className="ml-8 border-l border-[#244257] pl-4 text-[#7890a3]">
            8 canchas futbol 5
          </li>
          <li className="ml-8 border-l border-[#244257] pl-4 text-[#7890a3]">
            4 canchas futbol 7
          </li>
        </ul>
      </DashboardPanel>
    </div>
  );
}
