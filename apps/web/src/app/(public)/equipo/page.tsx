import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Trophy, UserPlus } from "lucide-react";
import { PublicFeaturePage } from "@/components/shared/PublicFeaturePage/PublicFeaturePage";

export default function EquipoPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <PublicFeaturePage
        eyebrow="Equipo"
        title="Gestiona tu equipo"
        highlight="en una vista"
        description="Reuni jugadores, roles, historial y proximos partidos para que el grupo funcione sin mensajes perdidos."
        imageSrc="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80"
        imageAlt="Equipo de futbol reunido antes de jugar"
        ctaLabel="Crear equipo"
        ctaHref="/register?role=player"
        steps={[
          {
            title: "Suma miembros",
            description: "Invita jugadores y mantene una lista clara de titulares, suplentes y contactos.",
            icon: UserPlus,
          },
          {
            title: "Mira el rendimiento",
            description: "Segui partidos, resultados y participacion para entender como viene el equipo.",
            icon: Trophy,
          },
          {
            title: "Ordena roles",
            description: "Define capitanes, administradores y permisos para que todos sepan que hacer.",
            icon: Shield,
          },
        ]}
        highlights={[
          { label: "Plantel", value: "Activo" },
          { label: "Proximos partidos", value: "Ordenados" },
          { label: "Roles", value: "Claros" },
        ]}
      />
      <Footer />
    </div>
  );
}
