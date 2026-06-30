"use client";

import { Bell, Calendar, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-[#4be176]" : "bg-[#1d3b52]"
      }`}
      onClick={onChange}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ConfiguracionPage() {
  const [emailAlert, setEmailAlert] = useState(true);
  const [whatsappAlert, setWhatsappAlert] = useState(false);
  const [newInquiriesAlert, setNewInquiriesAlert] = useState(true);

  const [autoConfirm, setAutoConfirm] = useState(false);
  const [requireDeposit, setRequireDeposit] = useState(true);
  const [allowCancel, setAllowCancel] = useState(true);

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-8 sm:px-6 lg:px-8 text-[#d7e8f2]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-white">Configuración</h1>
          <p className="mt-2 text-sm text-[#9fb3c5]">
            Ajustá cómo funciona tu complejo en Picadito.
          </p>
        </div>

        <div className="space-y-6">
          {/* Avisos */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
            <div className="flex items-center gap-2 border-b border-[#1d3b52] bg-[#0b1b28]/50 px-5 py-4">
              <Bell className="h-4 w-4 text-[#67a6d8]" />
              <h2 className="text-sm font-bold text-white">Avisos</h2>
            </div>
            <div className="divide-y divide-[#1d3b52]">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Avisarme por email cuando entra una reserva</span>
                <Toggle checked={emailAlert} onChange={() => setEmailAlert(!emailAlert)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Avisarme por WhatsApp cuando entra una reserva</span>
                <Toggle checked={whatsappAlert} onChange={() => setWhatsappAlert(!whatsappAlert)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Avisarme de consultas nuevas</span>
                <Toggle checked={newInquiriesAlert} onChange={() => setNewInquiriesAlert(!newInquiriesAlert)} />
              </div>
            </div>
          </div>

          {/* Reservas */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
            <div className="flex items-center gap-2 border-b border-[#1d3b52] bg-[#0b1b28]/50 px-5 py-4">
              <Calendar className="h-4 w-4 text-[#67a6d8]" />
              <h2 className="text-sm font-bold text-white">Reservas</h2>
            </div>
            <div className="divide-y divide-[#1d3b52]">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Confirmar reservas automáticamente</span>
                <Toggle checked={autoConfirm} onChange={() => setAutoConfirm(!autoConfirm)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Pedir seña para reservar</span>
                <Toggle checked={requireDeposit} onChange={() => setRequireDeposit(!requireDeposit)} />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Permitir cancelar hasta 2 horas antes</span>
                <Toggle checked={allowCancel} onChange={() => setAllowCancel(!allowCancel)} />
              </div>
            </div>
          </div>

          {/* Cuenta */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
            <div className="flex items-center gap-2 border-b border-[#1d3b52] bg-[#0b1b28]/50 px-5 py-4">
              <Settings className="h-4 w-4 text-[#67a6d8]" />
              <h2 className="text-sm font-bold text-white">Cuenta</h2>
            </div>
            <div className="divide-y divide-[#1d3b52]">
              <button className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[#15364f]">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Cambiar contraseña</span>
                <ChevronRight className="h-4 w-4 text-[#7890a3]" />
              </button>
              <button className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[#15364f]">
                <span className="text-[13px] font-medium text-[#d7e8f2]">Datos de facturación</span>
                <ChevronRight className="h-4 w-4 text-[#7890a3]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
