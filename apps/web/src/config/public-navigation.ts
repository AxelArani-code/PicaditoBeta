export type PublicNavItem = {
  label: string;
  href: string;
};

export const publicNavItems: PublicNavItem[] = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Reserva", href: "/reservar" },
  { label: "Partido", href: "/partido" },
  { label: "Equipo", href: "/equipo" },
  { label: "Rating", href: "/rating" },
  { label: "Perfil", href: "/perfil" },
];
