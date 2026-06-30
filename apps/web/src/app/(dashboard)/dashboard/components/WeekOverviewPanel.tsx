import { DashboardPanel } from "./DashboardPanel";

export function WeekOverviewPanel() {
  const data = [
    { label: "Hoy", value: 18, width: "65%" },
    { label: "Mañana", value: 12, width: "45%" },
    { label: "Sábado", value: 24, width: "85%" },
    { label: "Domingo", value: 20, width: "75%" },
  ];

  return (
    <DashboardPanel className="p-5 border-[#1d3b52] bg-[#102a40]/90">
      <div className="mb-6">
        <h2 className="text-base font-bold text-white">Cómo viene la semana</h2>
        <p className="mt-1 text-[13px] text-[#7890a3]">Cantidad de turnos por día</p>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[13px] font-bold text-[#d7e8f2]">
            <span className="w-16 text-[#9fb3c5]">{item.label}</span>
            <div className="mx-4 h-1.5 flex-1 rounded-full bg-[#071521]">
              <div className="h-full rounded-full bg-[#4be176]" style={{ width: item.width }}></div>
            </div>
            <span className="w-6 text-right font-black text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
