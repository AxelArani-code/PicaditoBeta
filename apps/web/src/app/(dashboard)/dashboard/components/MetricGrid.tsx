import { CalendarCheck, Clock3, DollarSign, MessageSquare } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";

export function MetricGrid() {
  const metrics = [
    {
      title: "Turnos de hoy",
      value: "18",
      detail: "14 confirmados, 3 a confirmar, 1 cancelado",
      icon: CalendarCheck,
    },
    {
      title: "Para confirmar",
      value: "3",
      detail: "Reservas esperando tu OK",
      icon: Clock3,
    },
    {
      title: "Consultas nuevas",
      value: "5",
      detail: "Mensajes sin responder",
      icon: MessageSquare,
    },
    {
      title: "Ingresos de hoy",
      value: "$86.000",
      detail: "De los turnos confirmados",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ title, value, detail, icon: Icon }) => (
        <DashboardPanel key={title} className="p-5 border-[#1d3b52] bg-[#102a40]/90">
          <div className="flex items-center gap-3 text-[#9fb3c5]">
            <Icon className="h-4 w-4 text-[#67a6d8]" />
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <p className="mt-5 text-4xl font-black text-white">{value}</p>
          <p className="mt-2 text-[13px] text-[#7890a3]">{detail}</p>
        </DashboardPanel>
      ))}
    </div>
  );
}
