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
    <div className="min-h-screen bg-[#07130b] text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-[#22c55e]/10 blur-[90px] md:h-[460px] md:w-[460px]" />

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
          <header className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link
                href={`/inicio/cancha/${venue.id}`}
                aria-label="Volver al detalle de cancha"
                className="shrink-0 rounded-full p-2 text-white/90 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link href="/inicio" className="truncate text-2xl font-black italic tracking-tight text-white sm:text-3xl">
                Picadito
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#2ddc68]/30 bg-[#1eb955]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#46ef82] sm:px-4 sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#46ef82]" />
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
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#c4cec1] sm:text-lg">
                  Revisa los detalles de tu proximo encuentro antes de confirmar el pago.
                </p>
              </div>

              <article className="overflow-hidden rounded-xl border border-white/15 bg-[#172117] shadow-2xl shadow-black/20">
                <div className="relative h-[190px] overflow-hidden sm:h-[230px] lg:h-[245px]">
                  <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172117] via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                    <span className="rounded-md bg-[#47e878] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#041409]">
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

              <section className="mt-8">
                <h2 className="text-2xl font-black text-white sm:text-3xl">Metodo de Pago</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <button className="rounded-xl border-2 border-[#45e877] bg-[#172117] p-4 text-left shadow-[0_0_0_3px_rgba(69,232,119,0.18)] sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-[#26314a]">
                          <span className="h-4 w-4 rounded-full bg-[#eb4d3d]" />
                          <span className="-ml-1 h-4 w-4 rounded-full bg-[#f59e2e]" />
                        </span>
                        <span className="truncate text-base font-black sm:text-lg">Mastercard **** 4242</span>
                      </div>
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-[#45e877]" />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-[#c4cec1]">Exp: 12/26</span>
                      <span className="font-black uppercase text-[#45e877]">Predeterminado</span>
                    </div>
                  </button>

                  <button className="rounded-xl border border-white/10 bg-[#172117] p-4 text-left transition hover:border-[#45e877]/60 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-white p-1">
                          <span className="block h-full w-full rounded-sm bg-[#2563eb]" />
                        </span>
                        <span className="text-base font-black sm:text-lg">PayPal</span>
                      </div>
                      <span className="h-6 w-6 shrink-0 rounded-full border-4 border-[#c4cec1]" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-[#d3ddd0]">Pago instantaneo seguro</p>
                  </button>
                </div>

                <button className="mt-6 flex items-center gap-3 text-sm font-black uppercase tracking-wide text-[#45e877] transition hover:text-white">
                  <Plus className="h-4 w-4" />
                  Anadir nuevo metodo
                </button>
              </section>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <section className="rounded-xl border-2 border-[#45e877] bg-[#172817] p-5 shadow-2xl shadow-[#0b2c16]/50 sm:p-7">
                <h2 className="text-2xl font-black sm:text-3xl">Desglose del Pago</h2>

                <div className="mt-6 space-y-5">
                  {paymentRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 text-base text-[#d8dfd6] sm:text-lg">
                      <span>{row.label}</span>
                      <span className="shrink-0 font-semibold text-white">{row.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-white/15" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#45e877] sm:text-sm">
                      Total a Pagar
                    </p>
                    <p className="mt-2 text-5xl font-black tracking-tight text-white sm:text-6xl">$72.50</p>
                  </div>
                  <p className="text-sm font-semibold text-[#d8dfd6] sm:pb-2">IVA incluido</p>
                </div>

                <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#49df79] px-5 py-4 text-base font-black text-black shadow-[0_18px_40px_rgba(73,223,121,0.24)] transition hover:bg-[#5cf08a] sm:text-lg">
                  Confirmar y Pagar
                  <WalletCards className="h-5 w-5" />
                </button>

                <p className="mx-auto mt-5 max-w-lg text-center text-sm font-semibold leading-tight text-[#d8dfd6]">
                  Al confirmar, aceptas nuestras{" "}
                  <Link href="#" className="text-[#45e877]">
                    Politicas de Cancelacion
                  </Link>{" "}
                  y Terminos de Servicio.
                </p>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoTile icon={ShieldCheck} title="Pago Seguro SSL" />
                <InfoTile icon={RotateCcw} title="Cancelacion 24h" />
              </div>

              <section className="relative overflow-hidden rounded-xl bg-[#071f29] p-5 sm:p-7">
                <div className="absolute -right-10 top-10 rotate-12 text-5xl opacity-10">Football</div>
                <h2 className="text-2xl font-black sm:text-3xl">Necesitas balones?</h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-[#d8dfd6]">
                  Anade equipamiento profesional a tu reserva por solo EUR 5 adicionales.
                </p>
                <button className="mt-5 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/15">
                  Anadir Equipamiento
                </button>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0d1628] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-black sm:text-2xl">Picadito</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm">
              (c) 2024 Picadito by Triasoft. All rights reserved. Engineered for the pitch.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:gap-8 sm:text-sm">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Support</Link>
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
      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#c4cec1] sm:text-sm">
        <Icon className="h-4 w-4" />
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
    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#172117] text-center sm:h-28">
      <Icon className="h-6 w-6 text-[#45e877]" />
      <p className="text-sm font-black text-white sm:text-base">{title}</p>
    </div>
  );
}
