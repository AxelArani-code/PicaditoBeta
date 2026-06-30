"use client";

import { Building2, Mail, MapPin, Pencil, Phone, Grid3x3 } from "lucide-react";

export default function MiComplejoPage() {
  return (
    <div className="min-h-full bg-[#07111d] px-4 py-8 sm:px-6 lg:px-8 text-[#d7e8f2]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Mi complejo</h1>
            <p className="mt-2 text-sm text-[#9fb3c5]">
              Los datos que ven tus clientes.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#4be176] px-6 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f]">
            <Pencil className="h-4 w-4" />
            Editar datos
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-8 text-center sm:text-left">
            <div className="mb-6 flex justify-center sm:justify-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1b28]/50 text-[#67a6d8]">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white">Complejo Las Cañas</h2>
            <p className="mt-1 text-sm text-[#7890a3]">San Rafael, Mendoza</p>
            <p className="mt-4 text-[13px] leading-relaxed text-[#d7e8f2]">
              Complejo deportivo con canchas de fútbol y pádel. Abierto todos los días con iluminación, vestuarios y estacionamiento.
            </p>
          </div>

          {/* Details Card */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
            <div className="divide-y divide-[#1d3b52]">
              <div className="flex items-start gap-4 px-6 py-5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Nombre</p>
                  <p className="mt-1 text-[13px] font-medium text-white">Complejo Las Cañas</p>
                </div>
              </div>

              <div className="flex items-start gap-4 px-6 py-5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Dirección</p>
                  <p className="mt-1 text-[13px] font-medium text-white">Av. Mitre 1234, San Rafael, Mendoza</p>
                </div>
              </div>

              <div className="flex items-start gap-4 px-6 py-5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Teléfono</p>
                  <p className="mt-1 text-[13px] font-medium text-white">2604 11-2233</p>
                </div>
              </div>

              <div className="flex items-start gap-4 px-6 py-5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Email</p>
                  <p className="mt-1 text-[13px] font-medium text-white">contacto@lascanas.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 px-6 py-5">
                <Grid3x3 className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Canchas</p>
                  <p className="mt-1 text-[13px] font-medium text-white">4 canchas (Fútbol 5, Fútbol 7 y Pádel)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
