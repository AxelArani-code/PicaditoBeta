"use client";

import { Reply } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = "nuevo" | "respondido";

type Message = {
  id: string;
  initials: string;
  name: string;
  time: string;
  status: MessageStatus;
  message: string;
};

// ─── Static data (no endpoint yet) ───────────────────────────────────────────

const MESSAGES: Message[] = [
  { id: "1", initials: "SL", name: "Sofía López", time: "Hace 2 horas", status: "nuevo",
    message: "Hola, ¿la Cancha 3 tiene luces para jugar de noche? Quería reservar a las 22." },
  { id: "2", initials: "FS", name: "Franco Suárez", time: "Hoy, 11:30", status: "nuevo",
    message: "Reservé la Cancha 1 pero necesito cambiar el horario para más tarde. ¿Se puede?" },
  { id: "3", initials: "DM", name: "Diego Morales", time: "Ayer", status: "respondido",
    message: "El otro día la cancha estaba un poco mojada. Avisen cuando llueve, gracias." },
  { id: "4", initials: "CV", name: "Carla V.", time: "Hace 2 días", status: "respondido",
    message: "¿Hacen descuento si reservo todos los martes del mes?" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: MessageStatus }) {
  return status === "nuevo" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd05a] px-2.5 py-0.5 text-[10px] font-bold text-[#ffd05a]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ffd05a]" />
      Nuevo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4be176] px-2.5 py-0.5 text-[10px] font-bold text-[#4be176]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4be176]" />
      Respondido
    </span>
  );
}

function MessageCard({ msg }: { msg: Message }) {
  return (
    <div className="flex flex-col rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#071521] text-[12px] font-bold text-[#67a6d8]">
            {msg.initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{msg.name}</h3>
            <p className="text-[11px] text-[#7890a3]">{msg.time}</p>
          </div>
        </div>
        <StatusPill status={msg.status} />
      </div>

      <p className="mb-4 flex-1 text-[13px] leading-relaxed text-[#d7e8f2]">{msg.message}</p>

      <div>
        <button className="inline-flex h-8 items-center gap-2 rounded-full bg-[#4be176] px-4 text-[11px] font-bold text-[#003915] transition hover:bg-[#6bfe8f]">
          <Reply className="h-3.5 w-3.5" />
          Responder
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReclamosPage() {
  const newCount = MESSAGES.filter((m) => m.status === "nuevo").length;

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Reclamos y consultas
          </h1>
          <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">
            Tenés {newCount} {newCount === 1 ? "mensaje" : "mensajes"} sin responder.
          </p>
        </div>

        {/* Grid: 1 col mobile, 2 cols tablet+ */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          {MESSAGES.map((msg) => (
            <MessageCard key={msg.id} msg={msg} />
          ))}
        </div>
      </div>
    </div>
  );
}
