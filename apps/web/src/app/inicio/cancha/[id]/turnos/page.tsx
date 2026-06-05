"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MapPin,
  Trophy,
} from "lucide-react";

type Venue = {
  id: number;
  name: string;
  location: string;
  pitch: string;
  price: string;
  image: string;
};

type DayOption = {
  day: string;
  date: string;
  label: string;
};

type Slot = {
  period: string;
  time: string;
  available: boolean;
};

const venues: Record<string, Venue> = {
  "1": {
    id: 1,
    name: "Stadium Central",
    location: "Stadium Central, Pitch 4",
    pitch: "Pitch #4 (Elite)",
    price: "$45.00",
    image: "https://i.pinimg.com/736x/77/73/de/7773de8e2480621c7c9ed9d348281c7a.jpg",
  },
  "2": {
    id: 2,
    name: "The Wembley Club",
    location: "The Wembley Club, Pitch 2",
    pitch: "Pitch #2 (Pro)",
    price: "$62.00",
    image: "https://i.pinimg.com/736x/dd/f5/68/ddf5687ae760d60764a9be38d9247ea5.jpg",
  },
  "3": {
    id: 3,
    name: "Arena Champions",
    location: "Arena Champions, Pitch 1",
    pitch: "Pitch #1 (Elite)",
    price: "$38.00",
    image: "https://i.pinimg.com/736x/62/04/21/62042179e162da00c410e70b5aac2ab8.jpg",
  },
};

const dayOptions: DayOption[] = [
  { day: "MON", date: "12", label: "Monday, Oct 12" },
  { day: "TUE", date: "13", label: "Tuesday, Oct 13" },
  { day: "WED", date: "14", label: "Wednesday, Oct 14" },
  { day: "THU", date: "15", label: "Thursday, Oct 15" },
  { day: "FRI", date: "16", label: "Friday, Oct 16" },
  { day: "SAT", date: "17", label: "Saturday, Oct 17" },
  { day: "SUN", date: "18", label: "Sunday, Oct 18" },
];

const slots: Slot[] = [
  { period: "Morning", time: "08:00", available: true },
  { period: "Morning", time: "09:00", available: false },
  { period: "Morning", time: "10:00", available: true },
  { period: "Morning", time: "11:00", available: true },
  { period: "Afternoon", time: "14:00", available: true },
  { period: "Afternoon", time: "15:00", available: true },
  { period: "Afternoon", time: "16:00", available: false },
  { period: "Afternoon", time: "17:00", available: true },
  { period: "Evening", time: "19:00", available: true },
  { period: "Evening", time: "20:00", available: true },
  { period: "Evening", time: "21:00", available: true },
  { period: "Evening", time: "22:00", available: false },
];

export default function SelectTurnPage() {
  const params = useParams();
  const venueId = params.id as string;
  const venue = venues[venueId] ?? venues["1"];
  const [selectedDay, setSelectedDay] = useState(dayOptions[1]);
  const [selectedSlot, setSelectedSlot] = useState(slots[4]);

  const selectedEndTime = useMemo(() => {
    const [hours] = selectedSlot.time.split(":").map(Number);
    return `${String(hours + 1).padStart(2, "0")}:00`;
  }, [selectedSlot.time]);

  return (
    <div className="min-h-screen bg-[#07110a] text-[#edf5eb]">
      <nav className="mx-auto flex w-[95%] max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[#28364c] bg-[#0f1723]/95 px-4 py-3 shadow-2xl shadow-black/30 sm:mt-6 sm:rounded-full sm:px-6 lg:px-8">
        <Link href="/inicio" className="text-xl font-black italic tracking-tight text-white sm:text-2xl">
          Picadito
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-slate-400 lg:flex">
          <Link href="#">Features</Link>
          <Link href="#">Teams</Link>
          <Link href="#">Live Stats</Link>
          <Link href="#">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-slate-400 transition hover:text-white sm:block">
            Login
          </Link>
          <Link href="/register" className="rounded-full bg-[#48df74] px-4 py-2 text-xs font-black text-[#042413] transition hover:bg-[#5cf08a] sm:px-6 sm:py-2.5 sm:text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 pt-8 sm:px-6 sm:pt-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8 xl:px-8">
        <section className="space-y-5 sm:space-y-6">
          <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">Book Your Pitch</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c4cec1] sm:text-base">
                Select your preferred time slot for a 60-minute match. Premium turf, professional lighting, and hydration included.
              </p>
            </div>
            <div className="flex max-w-full items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white sm:text-base lg:max-w-xs">
              <MapPin className="h-5 w-5 shrink-0 text-[#48ef7f]" />
              <span className="min-w-0 truncate">{venue.location}</span>
            </div>
          </header>

          <section className="rounded-xl border border-white/15 bg-[#172117]/90 p-4 shadow-2xl shadow-black/15 sm:p-5 lg:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
                <CalendarDays className="h-5 w-5 text-[#48ef7f] sm:h-6 sm:w-6" />
                Select Date
              </h2>
              <div className="flex gap-2">
                <IconButton label="Previous week" icon={ChevronLeft} />
                <IconButton label="Next week" icon={ChevronRight} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
              {dayOptions.map((day) => {
                const isSelected = selectedDay.date === day.date;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-lg border px-3 py-4 text-center transition sm:py-4 ${
                      isSelected
                        ? "border-[#35db6d] bg-[#173d22] text-[#4cff86] shadow-[0_0_24px_rgba(53,219,109,0.24)]"
                        : "border-white/10 bg-white/[0.04] text-[#d6dfd3] hover:border-[#35db6d]/60"
                    }`}
                  >
                    <span className="block text-sm font-semibold sm:text-base">{day.day}</span>
                    <span className="mt-1.5 block text-2xl font-black sm:text-[28px]">{day.date}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-white/15 bg-[#172117]/90 p-4 shadow-2xl shadow-black/15 sm:p-5 lg:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
                <Clock3 className="h-5 w-5 text-[#48ef7f] sm:h-6 sm:w-6" />
                Available Slots
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#c4cec1] sm:text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#48ef7f]" />
                  Available
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#313c32]" />
                  Booked
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = selectedSlot.time === slot.time;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`min-h-20 rounded-lg border p-4 text-left transition sm:min-h-24 ${
                      isSelected
                        ? "border-[#48ef7f] bg-[#164b27] text-[#48ef7f] shadow-[0_0_24px_rgba(72,239,127,0.18)]"
                        : slot.available
                          ? "border-white/10 bg-white/[0.04] text-white hover:border-[#48ef7f]/60"
                      : "cursor-not-allowed border-transparent bg-[#111c12]/70 text-[#65705f] opacity-70"
                    }`}
                  >
                    <span className="block text-sm sm:text-base">{slot.period}</span>
                    <span className="mt-1.5 block text-xl font-black sm:text-2xl">{slot.time}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </section>

        <aside className="space-y-5 xl:pt-[108px]">
          <section className="overflow-hidden rounded-xl border border-white/15 bg-[#172117] shadow-2xl shadow-black/25 md:grid md:grid-cols-[260px_minmax(0,1fr)] xl:block">
            <div className="relative h-44 md:h-full xl:h-44">
              <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172117] via-black/20 to-transparent" />
              <span className="absolute bottom-4 left-5 rounded-full bg-[#48df74] px-3 py-1 text-xs font-black text-[#042413]">
                Elite Turf
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-2xl font-black text-white sm:text-[26px]">Booking Summary</h2>
              <div className="mt-5 divide-y divide-white/10">
                <SummaryRow icon={CalendarDays} label="Date" value={selectedDay.label} />
                <SummaryRow icon={Clock3} label="Time" value={`${selectedSlot.time} - ${selectedEndTime}`} />
                <SummaryRow icon={Trophy} label="Pitch" value={venue.pitch} />
                <SummaryRow icon={CircleDollarSign} label="Total" value={venue.price} highlight />
              </div>

              <Link
                href={`/inicio/cancha/${venue.id}/confirmacion`}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#48df74] px-5 py-3.5 text-sm font-black text-[#06160b] shadow-[0_18px_40px_rgba(72,223,116,0.22)] transition hover:bg-[#5cf08a] sm:text-base"
              >
                Continuar
              </Link>
              <p className="mt-4 text-center text-sm text-[#c4cec1] sm:text-left">Free cancellation up to 24h before match</p>
            </div>
          </section>

          <section className="flex items-center justify-between gap-4 rounded-xl border border-[#23773c] bg-[#142018] p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1b4a25]">
                <BadgeCheck className="h-6 w-6 text-[#48ef7f]" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white sm:text-lg">Pro Membership</h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c4cec1]">
                  Save 15% on all bookings
                </p>
              </div>
            </div>
            <Link href="#" className="font-black text-[#48ef7f] transition hover:text-white">
              Join
            </Link>
          </section>
        </aside>
      </main>

      <footer className="border-t border-white/10 bg-[#0d1628] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-black sm:text-xl">Picadito</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
              (c) 2024 Picadito by Triasoft. All rights reserved. Engineered for the pitch.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:gap-6 sm:text-xs">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Support</Link>
            <Link href="#">API Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-[#48ef7f]/60 sm:h-11 sm:w-11"
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="flex items-center gap-3 text-sm text-[#c4cec1] sm:text-base">
        <Icon className="h-5 w-5 shrink-0 text-[#48ef7f]" />
        <span className="shrink-0">{label}</span>
      </div>
      <span className={`min-w-0 text-right text-sm font-black sm:text-base ${highlight ? "text-xl text-[#48ef7f] sm:text-2xl" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
