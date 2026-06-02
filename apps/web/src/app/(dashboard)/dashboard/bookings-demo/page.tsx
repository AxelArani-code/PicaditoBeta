"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { getBookings, getPitches, getVenues, testBackendConnection } from "../../../../services/bookings.service";
import { getAccessToken } from "@/lib/auth/session";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(value: string | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Booking = {
  id: string;
  status?: string;
  date?: string;
  totalPrice?: number;
  pitchName?: string;
  userName?: string;
  pitch?: { name?: string };
  pitches?: { name?: string };
  user?: { fullName?: string; name?: string };
};

export default function BookingsDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(8);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [connectionTestResult, setConnectionTestResult] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [pitchesResponse, setPitchesResponse] = useState<any>(null);
  const [pitchesError, setPitchesError] = useState<string>("");
  const [isLoadingPitches, setIsLoadingPitches] = useState<boolean>(false);
  const [venuesResponse, setVenuesResponse] = useState<any>(null);
  const [venuesError, setVenuesError] = useState<string>("");
  const [isLoadingVenues, setIsLoadingVenues] = useState<boolean>(false);

  useEffect(() => {
    console.log("📊 Dashboard Bookings: componente montado");
    const token = getAccessToken();
    console.log("📊 Dashboard Bookings: token actual en componente:", {
      tokenPresente: Boolean(token),
      token: token ? token.substring(0, 30) + "..." : "NO DISPONIBLE",
      fullToken: token,
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        console.log("📊 Dashboard Bookings: iniciando carga de reservas");
        
        const filters: Record<string, unknown> = {
          pageNumber,
          pageSize,
        };

        if (statusFilter !== "all") {
          filters.status = statusFilter;
        }

        const response = await getBookings(filters);
        console.log("📊 Dashboard Bookings: respuesta recibida:", {
          itemsLength: response.items?.length,
          pageNumber: response.pageNumber,
          totalPages: response.totalPages,
        });
        
        setBookings(response.items ?? []);
        setTotalPages(response.totalPages ?? 1);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar reservas.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [pageNumber, pageSize, statusFilter]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPageNumber(1);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const result = await testBackendConnection();
    setConnectionTestResult(result);
    setIsTestingConnection(false);
  };

  const handleGetPitches = async () => {
    setIsLoadingPitches(true);
    setPitchesError("");
    setPitchesResponse(null);

    try {
      const data = await getPitches();
      setPitchesResponse(data);
    } catch (err) {
      if (err instanceof Error) {
        setPitchesError(err.message);
      } else {
        setPitchesError("Error desconocido al obtener pitches.");
      }
    } finally {
      setIsLoadingPitches(false);
    }
  };

  const handleGetVenues = async () => {
    setIsLoadingVenues(true);
    setVenuesError("");
    setVenuesResponse(null);

    try {
      const data = await getVenues();
      setVenuesResponse(data);
    } catch (err) {
      if (err instanceof Error) {
        setVenuesError(err.message);
      } else {
        setVenuesError("Error desconocido al obtener venues.");
      }
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const handlePrev = () => {
    setPageNumber((current) => Math.max(current - 1, 1));
  };

  const handleNext = () => {
    setPageNumber((current) => Math.min(current + 1, totalPages));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-white">Dashboard de Reservas</h1>
        <p className="mt-2 text-sm text-[#bccbb9]">
          Ejemplo de integración con API .NET local usando fetch y token JWT desde localStorage.
        </p>
        <button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className="mt-4 rounded-lg border border-[#4be176]/40 bg-[#4be176]/10 px-4 py-2 text-sm font-medium text-[#6bfe8f] transition hover:bg-[#4be176]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTestingConnection ? "Probando conexión..." : "🧪 Probar Conexión Backend"}
        </button>

        <button
          onClick={handleGetPitches}
          disabled={isLoadingPitches}
          className="mt-3 rounded-lg border border-[#ffd05a]/40 bg-[#ffd05a]/10 px-4 py-2 text-sm font-medium text-[#ffefb0] transition hover:bg-[#ffd05a]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingPitches ? "Solicitando pitches..." : "⚽ Consultar /api/proxy/pitches"}
        </button>

        <button
          onClick={handleGetVenues}
          disabled={isLoadingVenues}
          className="mt-3 rounded-lg border border-[#7cceff]/40 bg-[#7cceff]/10 px-4 py-2 text-sm font-medium text-[#eaf8ff] transition hover:bg-[#7cceff]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingVenues ? "Solicitando venues..." : "🏟️ Consultar /api/proxy/venues"}
        </button>

        {venuesResponse && (
          <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-[#0d2b3a]">
            <div className="mb-2 font-semibold text-white">Respuesta JSON de /api/proxy/venues:</div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-[#07121d] p-3 text-[11px] leading-5 text-[#cde8ff]">
              {JSON.stringify(venuesResponse, null, 2)}
            </pre>
          </div>
        )}

        {venuesError && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {venuesError}
          </div>
        )}

        {pitchesResponse && (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-[#4c3c00]">
            <div className="mb-2 font-semibold text-white">Respuesta JSON de /api/proxy/pitches:</div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-[#1a1305] p-3 text-[11px] leading-5 text-[#ffefb0]">
              {JSON.stringify(pitchesResponse, null, 2)}
            </pre>
          </div>
        )}

        {pitchesError && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {pitchesError}
          </div>
        )}

        {connectionTestResult !== null && (
          <div className={`mt-3 rounded-lg p-3 text-sm ${connectionTestResult ? "border border-green-500/30 bg-green-500/10 text-green-200" : "border border-red-500/30 bg-red-500/10 text-red-200"}`}>
            {connectionTestResult ? "✅ Backend conectando correctamente" : "❌ No se puede conectar con el backend"}
          </div>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <label className="mb-2 block text-sm font-medium text-[#dce5d9]">Filtrar por estado</label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full rounded-xl border border-[#3d4a3d] bg-[#0e150e] px-4 py-2 text-sm text-white outline-none transition"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-[#bccbb9]">Paginación</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={pageNumber <= 1}
              className="rounded-xl border border-[#3d4a3d] bg-[#0e150e] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-[#dce5d9]">Página {pageNumber} de {totalPages}</span>
            <button
              type="button"
              onClick={handleNext}
              disabled={pageNumber >= totalPages}
              className="rounded-xl border border-[#3d4a3d] bg-[#0e150e] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* Debug panel */}
      <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[#bccbb9] hover:text-white">
          🔍 Info de Diagnóstico (Click para expandir)
        </summary>
        <div className="mt-3 space-y-2 text-xs font-mono text-[#9ab59d]">
          <div>API URL: <span className="text-[#dce5d9]">http://localhost:5000/api/Bookings</span></div>
          <div>Token presente: <span className="text-[#6bfe8f]">{getAccessToken() ? "✓ SÍ" : "✗ NO"}</span></div>
          <div>Token preview: <span className="text-[#dce5d9]">{getAccessToken() ? getAccessToken()!.substring(0, 30) + "..." : "N/A"}</span></div>
          <div>Estado carga: <span className="text-[#dce5d9]">{isLoading ? "Cargando..." : "Listo"}</span></div>
          <div>Items en tabla: <span className="text-[#dce5d9]">{bookings.length}</span></div>
        </div>
      </details>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {isLoading ? (
          <div className="py-12 text-center text-base font-medium text-[#dce5d9]">Cargando reservas...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-base text-[#bccbb9]">No hay reservas para mostrar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[#dce5d9]">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-[#9ab59d]">
                <tr>
                  <th className="px-4 py-3">Cancha</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-white">
                      {booking.pitchName ?? booking.pitch?.name ?? booking.pitches?.name ?? "Sin nombre"}
                    </td>
                    <td className="px-4 py-4 text-[#bccbb9]">
                      {booking.userName ?? booking.user?.fullName ?? booking.user?.name ?? booking.userName ?? "Usuario"}
                    </td>
                    <td className="px-4 py-4 capitalize text-[#6bfe8f]">{booking.status ?? "-"}</td>
                    <td className="px-4 py-4 text-[#bccbb9]">{formatDate(booking.date)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-white">
                      {booking.totalPrice != null ? `$${Number(booking.totalPrice).toLocaleString("es-AR")}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
