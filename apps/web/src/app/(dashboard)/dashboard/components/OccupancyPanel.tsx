import { DashboardPanel } from "./DashboardPanel";

export function OccupancyPanel() {
  return (
    <DashboardPanel className="p-5 border-[#1d3b52] bg-[#102a40]/90">
      <div className="mb-6">
        <h2 className="text-base font-bold text-white">¿Cómo vienen tus canchas hoy?</h2>
        <p className="mt-1 text-[13px] text-[#7890a3]">Qué tan ocupada está cada una</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between text-[13px] font-bold">
            <span className="text-white">Cancha 1</span>
            <span className="text-[#ff6b6b]">Muy ocupada</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#071521]">
            <div className="h-full w-[85%] rounded-full bg-[#4be176]"></div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-[13px] font-bold">
            <span className="text-white">Cancha 2</span>
            <span className="text-[#ffd05a]">Movida</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#071521]">
            <div className="h-full w-[60%] rounded-full bg-[#4be176]"></div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-[13px] font-bold">
            <span className="text-white">Cancha 3</span>
            <span className="text-[#4be176]">Tranquila</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#071521]">
            <div className="h-full w-[30%] rounded-full bg-[#4be176]"></div>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
