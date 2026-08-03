import { VenueClosuresManager } from "@/components/dashboard/VenueClosuresManager";

export const metadata = {
  title: "Cierres de Cancha | Picadito Dashboard",
  description:
    "Bloqueá fechas completas para mantenimiento, feriados o cualquier evento que impida reservas en tu complejo.",
};

export default function CierresPage() {
  return <VenueClosuresManager />;
}
