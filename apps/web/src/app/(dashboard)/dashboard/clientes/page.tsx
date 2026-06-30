"use client";

import { Search, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useDashboardClientes } from "@/hooks/useDashboardClientes";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Mobile: card per client
function ClientCard({ client }: { client: any }) {
  return (
    <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071521] text-[12px] font-bold text-[#67a6d8]">
          {getInitials(client.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{client.name}</p>
          <p className="text-[11px] text-[#7890a3]">Último turno: {formatRelativeDate(client.lastBooking)}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-[#1d3b52] px-2.5 py-0.5 text-[10px] font-bold text-[#7890a3]">
          {client.bookingsCount} reservas
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-[#9fb3c5]">
        {client.phone !== "—" && (
          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-[#4a6a82]" />{client.phone}</span>
        )}
        {client.email !== "—" && (
          <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3 text-[#4a6a82]" />{client.email}</span>
        )}
      </div>
    </div>
  );
}

// Desktop: table row
function ClientRow({ client }: { client: any }) {
  return (
    <tr className="border-t border-[#1d3b52] transition hover:bg-[#0c1f2e]/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#071521] text-[12px] font-bold text-[#67a6d8]">
            {getInitials(client.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{client.name}</p>
            <p className="text-[11px] text-[#7890a3]">Último turno: {formatRelativeDate(client.lastBooking)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px] text-[#9fb3c5]">
        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#4a6a82]" />{client.phone}</span>
      </td>
      <td className="px-4 py-3 text-[13px] text-[#9fb3c5]">
        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#4a6a82]" />{client.email}</span>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-[#1d3b52] px-2.5 py-1 text-[11px] font-bold text-[#7890a3]">
          {client.bookingsCount} reservas
        </span>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const { clients, loading, error, refetch } = useDashboardClientes();

  const filtered = clients.filter(
    (c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Clientes</h1>
            <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">
              {loading ? "Cargando..." : `${clients.length} clientes registrados`}
            </p>
          </div>

          {/* Search */}
          <div className="flex h-10 items-center gap-2 rounded-full border border-[#1d3b52] bg-[#0c1f2e] px-4">
            <Search className="h-4 w-4 shrink-0 text-[#4a6a82]" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#4a6a82]"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando clientes..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#4a6a82]">No se encontraron clientes.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="space-y-3 sm:hidden">
              {filtered.map((c: any) => <ClientCard key={c.id} client={c} />)}
            </div>

            {/* Tablet/Desktop: table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
              <div className="flex items-center gap-3 border-b border-[#1d3b52] bg-[#071521]/50 px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a6a82]">
                  {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1d3b52]">
                      {["Cliente", "Teléfono", "Email", "Reservas"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#4a6a82]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c: any) => <ClientRow key={c.id} client={c} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
