"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

type BookingVenue = {
  id: number;
  name: string;
  badge: string;
  date: string;
  time: string;
  size: string;
  city: string;
  image: string;
};

const venues: Record<string, BookingVenue> = {
  "1": {
    id: 1,
    name: "Estadio Santiago Bernabeu (Anexo)",
    badge: "Premium Pitch",
    date: "Viernes, 24 Mayo",
    time: "20:00 - 21:00",
    size: "Futbol 5",
    city: "Madrid",
    image: "https://i.pinimg.com/736x/62/04/21/62042179e162da00c410e70b5aac2ab8.jpg",
  },
  "2": {
    id: 2,
    name: "The Wembley Club",
    badge: "Ultimos Cupos",
    date: "Sabado, 25 Mayo",
    time: "19:00 - 20:00",
    size: "Futbol 11",
    city: "Buenos Aires",
    image: "https://i.pinimg.com/736x/dd/f5/68/ddf5687ae760d60764a9be38d9247ea5.jpg",
  },
  "3": {
    id: 3,
    name: "Arena Champions",
    badge: "Disponible",
    date: "Domingo, 26 Mayo",
    time: "18:00 - 19:00",
    size: "Futbol 5",
    city: "Suba",
    image: "https://i.pinimg.com/736x/77/73/de/7773de8e2480621c7c9ed9d348281c7a.jpg",
  },
};

const paymentRows = [
  { label: "Alquiler de Campo (60 min)", amount: "$65.00" },
  { label: "Suplemento Iluminacion", amount: "$5.00" },
  { label: "Gastos de Gestion", amount: "$2.50" },
];

export default function BookingConfirmationPage() {
  const params = useParams();
  const venueId = params.id as string;
  const venue = venues[venueId] ?? venues["1"];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <main className="relative overflow-hidden">
        {/* Cyan glow background effect */}
        <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-[#4be176]/10 blur-[90px] md:h-[460px] md:w-[460px]" />
        <div className="pointer-events-none absolute left-0 bottom-24 h-64 w-64 rounded-full bg-[#3b82f6]/10 blur-[90px]" />

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
          {/* Header */}
          <header className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link
                href={`/inicio/cancha/${venue.id}`}
                aria-label="Volver al detalle de cancha"
                className="shrink-0 rounded-full p-2 text-white/90 transition hover:bg-[#4be176]/10 hover:text-[#4be176]"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link href="/inicio" className="truncate text-2xl font-black italic tracking-tight text-white sm:text-3xl">
                Picadito
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#22d3ee]/30 bg-[#4be176]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#4be176] sm:px-4 sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4be176]" />
              <span className="hidden min-[380px]:inline">Reserva activa</span>
              <span className="min-[380px]:hidden">Activa</span>
            </div>
          </header>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(350px,0.48fr)] xl:gap-9">
            <section>
              <div className="mb-6 sm:mb-7">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
                  Finalizar Reserva
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#8b949e] sm:text-lg">
                  Revisa los detalles de tu proximo encuentro antes de confirmar el pago.
                </p>
              </div>

              {/* Venue Card */}
              <article className="overflow-hidden rounded-xl border border-[#1e3a5f] bg-[#161b22] shadow-2xl shadow-black/20">
                <div className="relative h-[190px] overflow-hidden sm:h-[230px] lg:h-[245px]">
                  <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                    <span className="rounded-md bg-[#4be176] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0d1117]">
                      {venue.badge}
                    </span>
                    <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">
                      {venue.name}
                    </h2>
                  </div>
                </div>

                <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
                  <DetailItem icon={CalendarDays} label="Fecha" value={venue.date} />
                  <DetailItem icon={Clock3} label="Horario" value={venue.time} />
                  <DetailItem icon={Users} label="Tamano" value={venue.size} />
                  <DetailItem icon={MapPin} label="Ciudad" value={venue.city} />
                </div>
              </article>

              {/* Payment Method */}
              <section className="mt-8">
                <h2 className="text-2xl font-black text-white sm:text-3xl">Metodo de Pago</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {/* Mastercard - selected */}
                  <button className="rounded-xl border-2 border-[#22d3ee] bg-[#0e2a3a] p-4 text-left shadow-[0_0_0_3px_rgba(34,211,238,0.18)] sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-[#1e3a5f]">
                          <span className="h-4 w-4 rounded-full bg-[#eb4d3d]" />
                          <span className="-ml-1 h-4 w-4 rounded-full bg-[#f59e2e]" />
                        </span>
                        <span className="truncate text-base font-black sm:text-lg">Mastercard **** 4242</span>
                      </div>
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-[#4be176]" />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-[#8b949e]">Exp: 12/26</span>
                      <span className="font-black uppercase text-[#4be176]">Predeterminado</span>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button className="rounded-xl border border-[#1e3a5f] bg-[#161b22] p-4 text-left transition hover:border-[#22d3ee]/60 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-white p-1">
                          <span className="block h-full w-full rounded-sm bg-[#2563eb]" />
                        </span>
                        <span className="text-base font-black sm:text-lg">PayPal</span>
                      </div>
                      <span className="h-6 w-6 shrink-0 rounded-full border-4 border-[#4a6280]" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-[#8b949e]">Pago instantaneo seguro</p>
                  </button>
                </div>

                <button className="mt-6 flex items-center gap-3 text-sm font-black uppercase tracking-wide text-[#4be176] transition hover:text-white">
                  <Plus className="h-4 w-4" />
                  Anadir nuevo metodo
                </button>
              </section>
            </section>

            {/* Right Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Payment Breakdown */}
              <section className="rounded-xl border-2 border-[#22d3ee] bg-[#0e2a3a] p-5 shadow-2xl shadow-[#22d3ee]/10 sm:p-7">
                <h2 className="text-2xl font-black sm:text-3xl">Desglose del Pago</h2>

                <div className="mt-6 space-y-5">
                  {paymentRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 text-base text-[#8b949e] sm:text-lg">
                      <span>{row.label}</span>
                      <span className="shrink-0 font-semibold text-white">{row.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-[#1e3a5f]" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#4be176] sm:text-sm">
                      Total a Pagar
                    </p>
                    <p className="mt-2 text-5xl font-black tracking-tight text-white sm:text-6xl">$72.50</p>
                  </div>
                  <p className="text-sm font-semibold text-[#8b949e] sm:pb-2">IVA incluido</p>
                </div>

                <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#4be176] px-5 py-4 text-base font-black text-[#0d1117] shadow-[0_18px_40px_rgba(34,211,238,0.24)] transition hover:bg-[#06b6d4] sm:text-lg">
                  Confirmar y Pagar
                  <WalletCards className="h-5 w-5" />
                </button>

                <p className="mx-auto mt-5 max-w-lg text-center text-sm font-semibold leading-tight text-[#8b949e]">
                  Al confirmar, aceptas nuestras{" "}
                  <Link href="#" className="text-[#4be176] hover:underline">
                    Politicas de Cancelacion
                  </Link>{" "}
                  y Terminos de Servicio.
                </p>
              </section>

              {/* Security Tiles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoTile icon={ShieldCheck} title="Pago Seguro SSL" />
                <InfoTile icon={RotateCcw} title="Cancelacion 24h" />
              </div>

              {/* Equipment Upsell */}
              <section className="relative overflow-hidden rounded-xl border border-[#1e3a5f] bg-[#161b22] p-5 sm:p-7">
                <div className="absolute -right-10 top-10 rotate-12 text-5xl opacity-5">Football</div>
                <h2 className="text-2xl font-black sm:text-3xl">Necesitas balones?</h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-[#8b949e]">
                  Anade equipamiento profesional a tu reserva por solo EUR 5 adicionales.
                </p>
                <button className="mt-5 rounded-lg border border-[#1e3a5f] bg-[#0d1117] px-5 py-2.5 text-sm font-black text-white transition hover:border-[#22d3ee]/60 hover:text-[#4be176]">
                  Anadir Equipamiento
                </button>
              </section>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e3a5f] bg-[#161b22] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-black sm:text-2xl">Picadito</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#4be176] sm:text-sm">
              © 2024 Picadito by Triasoft. All rights reserved. Engineered for the pitch.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4be176] sm:gap-8 sm:text-sm">
            <Link href="#" className="hover:text-[#4be176] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#4be176] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#4be176] transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#4be176] sm:text-sm">
        <Icon className="h-4 w-4 text-[#4be176]" />
        {label}
      </div>
      <p className="mt-2 text-base font-semibold text-white sm:text-lg">{value}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-[#1e3a5f] bg-[#161b22] text-center sm:h-28">
      <Icon className="h-6 w-6 text-[#4be176]" />
      <p className="text-sm font-black text-white sm:text-base">{title}</p>
    </div>
  );
}
