"use client";

import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import {
  X,
  Calendar,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  type DayScheduleState,
  type AvailabilityRuleResponse,
  type BackendListResponse,
  buildDefaultSchedule,
  mergeRulesIntoSchedule,
} from "@/lib/schedule/availability-helpers";

export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitchId: string;
  pitchName?: string;
  pitchType?: string;
  accessToken?: string | null;
}

type ScheduleAction =
  | { type: "LOAD"; payload: DayScheduleState[] }
  | { type: "UPDATE_FIELD"; index: number; field: keyof DayScheduleState; value: unknown };

function scheduleReducer(state: DayScheduleState[], action: ScheduleAction): DayScheduleState[] {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "UPDATE_FIELD": {
      const next = [...state];
      next[action.index] = { ...next[action.index], [action.field]: action.value };
      return next;
    }
    default:
      return state;
  }
}

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const DAY_ABBR = ["Lun", "Mar", "Mi\u00e9", "Jue", "Vie", "S\u00e1b", "Dom"];

// ── Estado de progreso al guardar ─────────────────────────────────────────────

type SaveStepStatus = "pending" | "sending" | "ok" | "error";

interface SaveStep {
  dayES: string;
  dayEN: string;
  status: SaveStepStatus;
  errorMsg?: string;
}

// ── Sub-componente: SaveProgressOverlay ───────────────────────────────────────

interface SaveProgressOverlayProps {
  steps: SaveStep[];
  allDone: boolean;
  onClose: () => void;
}

function SaveProgressOverlay({ steps, allDone, onClose }: SaveProgressOverlayProps) {
  const total   = steps.length;
  const done    = steps.filter((s) => s.status === "ok" || s.status === "error").length;
  const failed  = steps.filter((s) => s.status === "error").length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#07111d]/97 backdrop-blur-sm px-8">
      {/* Icono central */}
      <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ${
        allDone && failed === 0
          ? "bg-[#4be176]/20 shadow-lg shadow-[#4be176]/20"
          : allDone && failed > 0
          ? "bg-red-500/10"
          : "bg-[#0d1a0f]"
      }`}>
        {allDone && failed === 0 ? (
          <CheckCircle className="h-8 w-8 text-[#4be176] animate-in zoom-in-50 duration-300" />
        ) : allDone && failed > 0 ? (
          <AlertCircle className="h-8 w-8 text-red-400" />
        ) : (
          <Loader2 className="h-8 w-8 text-[#4be176] animate-spin" />
        )}
      </div>

      {/* Texto de estado */}
      <div className="text-center">
        {allDone ? (
          failed === 0 ? (
            <>
              <p className="text-base font-black text-[#dce5d9]">Horarios guardados</p>
              <p className="mt-1 text-xs text-[#4be176]">{total} dia{total !== 1 ? "s" : ""} configurado{total !== 1 ? "s" : ""} correctamente</p>
            </>
          ) : (
            <>
              <p className="text-base font-black text-[#dce5d9]">Guardado parcial</p>
              <p className="mt-1 text-xs text-red-400">{failed} dia{failed !== 1 ? "s" : ""} con error</p>
            </>
          )
        ) : (
          <>
            <p className="text-base font-black text-[#dce5d9]">Guardando horarios...</p>
            <p className="mt-1 text-xs text-[#4a5a4a]">{done} de {total} completado{done !== 1 ? "s" : ""}</p>
          </>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-xs">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#1e3a28]">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              allDone && failed > 0 ? "bg-red-500" : "bg-[#4be176]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-[#3a4a3a]">
          <span>{pct}%</span>
          <span>{done}/{total}</span>
        </div>
      </div>

      {/* Lista de pasos */}
      <div className="w-full max-w-xs space-y-2">
        {steps.map((step) => (
          <div
            key={step.dayEN}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-300 ${
              step.status === "ok"
                ? "border-[#4be176]/20 bg-[#4be176]/5"
                : step.status === "error"
                ? "border-red-900/30 bg-red-950/20"
                : step.status === "sending"
                ? "border-[#1e3a28] bg-[#0d1a0f]"
                : "border-[#152218] bg-transparent"
            }`}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              {step.status === "ok" && <CheckCircle className="h-4 w-4 text-[#4be176]" />}
              {step.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
              {step.status === "sending" && <Loader2 className="h-4 w-4 animate-spin text-[#4be176]" />}
              {step.status === "pending" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a28]" />
              )}
            </div>
            <span className={`flex-1 text-xs font-bold ${
              step.status === "ok"
                ? "text-[#4be176]"
                : step.status === "error"
                ? "text-red-400"
                : step.status === "sending"
                ? "text-[#dce5d9]"
                : "text-[#3a4a3a]"
            }`}>
              {step.dayES}
            </span>
            {step.status === "error" && step.errorMsg && (
              <span className="text-[10px] text-red-400/70 truncate max-w-[80px]" title={step.errorMsg}>
                {step.errorMsg}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Boton cerrar - solo cuando termino */}
      {allDone && (
        <button
          type="button"
          onClick={onClose}
          className={`rounded-2xl px-6 py-2.5 text-sm font-black transition animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            failed === 0
              ? "bg-[#4be176] text-[#021308] hover:brightness-110"
              : "border border-[#1e271e] text-[#6b7f6b] hover:bg-[#111811]"
          }`}
        >
          {failed === 0 ? "Listo" : "Cerrar"}
        </button>
      )}
    </div>
  );
}

// ── WeekCalendar ──────────────────────────────────────────────────────────────

interface WeekCalendarProps {
  schedule: DayScheduleState[];
  todayIndex: number;
  selectedIndex: number | null;
  onSelectDay: (index: number) => void;
  now: Date;
  compact: boolean;
}

function WeekCalendar({ schedule, todayIndex, selectedIndex, onSelectDay, now, compact }: WeekCalendarProps) {
  const monthName = now.toLocaleDateString("es-AR", { month: "long" });
  const year = now.getFullYear();

  const weekDates = (() => {
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  })();

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black text-[#dce5d9]">
          {compact ? "Semana" : "Fecha de turno"}
        </p>
        <span className="flex items-center gap-1.5 rounded-full border border-[#1e3a28] bg-[#0d1a0f] px-3 py-1 text-[11px] font-bold capitalize text-[#5a7a5a]">
          {monthName} {year}
          <svg className="h-3 w-3 text-[#4a5a4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_ABBR.map((abbr) => (
          <div key={abbr} className="flex items-center justify-center py-1">
            <span className="text-[11px] font-bold text-[#4a5a4a]">{abbr}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {schedule.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isSelected = idx === selectedIndex;
          const date = weekDates[idx];
          const isHighlighted = isSelected || (isToday && selectedIndex === null);

          return (
            <div key={day.dayEN} className="flex items-center justify-center py-1">
              <button
                type="button"
                onClick={() => onSelectDay(idx)}
                className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                  compact ? "h-8 w-8 rounded-xl" : "h-10 w-10 rounded-2xl"
                } ${
                  isHighlighted
                    ? "bg-[#4be176] shadow-lg shadow-[#4be176]/30"
                    : "hover:bg-[#0d1a0f]"
                }`}
              >
                <span
                  className={`font-black leading-none transition-all ${
                    compact ? "text-sm" : "text-base"
                  } ${
                    isHighlighted
                      ? "text-[#021308]"
                      : isToday
                      ? "text-[#4be176]"
                      : day.isOpen
                      ? "text-[#d7e8f2]"
                      : "text-[#3a5a4a]"
                  }`}
                >
                  {date}
                </span>
                {!isHighlighted && day.isOpen && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#4be176]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DayDetailForm ─────────────────────────────────────────────────────────────

interface DayDetailFormProps {
  day: DayScheduleState;
  index: number;
  dispatch: React.Dispatch<ScheduleAction>;
  todayIndex: number;
}

function DayDetailForm({ day, index, dispatch, todayIndex }: DayDetailFormProps) {
  const isToday = index === todayIndex;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-[#1a241a]" />
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${
              day.isOpen
                ? "bg-[#4be176]/10 border border-[#4be176]/20"
                : "bg-[#0d1a0f] border border-[#1e3a28]"
            }`}
          >
            <span className={`text-xs font-black ${day.isOpen ? "text-[#4be176]" : "text-[#4a5a4a]"}`}>
              {day.dayES}
            </span>
            {isToday && (
              <span className="text-[9px] font-black uppercase tracking-widest text-[#4be176]/60">hoy</span>
            )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={day.isOpen}
            onClick={() =>
              dispatch({ type: "UPDATE_FIELD", index, field: "isOpen", value: !day.isOpen })
            }
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              day.isOpen
                ? "border-[#4be176]/30 bg-[#4be176]/10 text-[#4be176] hover:bg-[#4be176]/20"
                : "border-[#1e3a28] bg-[#0d1a0f] text-[#3a5a4a] hover:border-[#2d5c3a] hover:text-[#5a7a5a]"
            }`}
          >
            {day.isOpen ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
            {day.isOpen ? "Abierto" : "Cerrado"}
          </button>
        </div>
        <div className="flex-1 h-px bg-[#1a241a]" />
      </div>

      {day.isOpen ? (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`detail-start-${day.dayEN}`}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3a4a3a]"
            >
              <Clock className="h-3 w-3 text-[#4be176]/60" />
              Apertura
            </label>
            <input
              type="time"
              id={`detail-start-${day.dayEN}`}
              value={day.startTime}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FIELD", index, field: "startTime", value: e.target.value })
              }
            className="w-full rounded-xl border border-[#1e3a28] bg-[#050e15] px-3 py-2.5 text-sm font-semibold text-[#d7e8f2] transition focus:border-[#4be176] focus:outline-none focus:ring-1 focus:ring-[#4be176]/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`detail-end-${day.dayEN}`}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3a4a3a]"
            >
              <Clock className="h-3 w-3 text-[#4be176]/60" />
              Cierre
            </label>
            <input
              type="time"
              id={`detail-end-${day.dayEN}`}
              value={day.endTime}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FIELD", index, field: "endTime", value: e.target.value })
              }
            className="w-full rounded-xl border border-[#1e3a28] bg-[#050e15] px-3 py-2.5 text-sm font-semibold text-[#d7e8f2] transition focus:border-[#4be176] focus:outline-none focus:ring-1 focus:ring-[#4be176]/30"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor={`detail-price-${day.dayEN}`}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3a4a3a]"
            >
              <DollarSign className="h-3 w-3 text-[#4be176]/60" />
              Precio por turno
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#4be176]/60">$</span>
              <input
                type="number"
                id={`detail-price-${day.dayEN}`}
                value={day.priceOverride || ""}
                min={0}
                step={500}
                placeholder="0"
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FIELD", index, field: "priceOverride", value: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-[#1e3a28] bg-[#050e15] py-2.5 pl-8 pr-4 text-sm font-semibold text-[#d7e8f2] transition focus:border-[#4be176] focus:outline-none focus:ring-1 focus:ring-[#4be176]/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-[#3a4a3a] py-2 animate-in fade-in duration-200">
          Este dia esta marcado como cerrado. Activa el toggle para configurar el horario.
        </p>
      )}
    </div>
  );
}

// ── ScheduleModal ─────────────────────────────────────────────────────────────

export function ScheduleModal({
  isOpen,
  onClose,
  pitchId,
  pitchName = "Cancha",
  pitchType = "",
  accessToken,
}: ScheduleModalProps) {
  const backdropRef   = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const [schedule, dispatch] = useReducer(scheduleReducer, undefined, buildDefaultSchedule);
  const [isLoading,    setIsLoading]    = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const todayIndex = getTodayIndex();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(todayIndex);

  // Estado del progreso de guardado
  const [saveSteps,  setSaveSteps]  = useState<SaveStep[]>([]);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveDone,   setSaveDone]   = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const buildHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
  }, [accessToken]);

  const fetchRules = useCallback(async () => {
    if (!pitchId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `/api/availability-rules?pitchId=${encodeURIComponent(pitchId)}`,
        { headers: buildHeaders() }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      // El backend devuelve { items: [...], totalCount, ... }
      const response: BackendListResponse = await res.json();
      console.log("[ScheduleModal] fetchRules response:", JSON.stringify(response));
      dispatch({ type: "LOAD", payload: mergeRulesIntoSchedule(response) });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error al cargar horarios");
    } finally {
      setIsLoading(false);
    }
  }, [pitchId, buildHeaders]);

  useEffect(() => {
    if (!isOpen) return;
    fetchRules();
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !isSaving) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, isSaving]);

  useEffect(() => {
    if (!isOpen) {
      setLoadError(null);
      setSaveSteps([]);
      setIsSaving(false);
      setSaveDone(false);
      setSelectedDayIndex(todayIndex);
    }
  }, [isOpen, todayIndex]);

  // ── Guardado secuencial ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!pitchId || pitchId.trim() === "") return;

    const openDays = schedule.filter((d) => d.isOpen);
    if (openDays.length === 0) return;

    console.log("[ScheduleModal] Guardando para pitchId:", pitchId, "| dias:", openDays.map(d => d.dayEN));

    // Inicializar pasos
    const initial: SaveStep[] = openDays.map((d) => ({
      dayES:  d.dayES,
      dayEN:  d.dayEN,
      status: "pending",
    }));
    setSaveSteps(initial);
    setIsSaving(true);
    setSaveDone(false);

    const updated = [...initial];

    for (let i = 0; i < openDays.length; i++) {
      const day = openDays[i];

      // Marcar como enviando
      updated[i] = { ...updated[i], status: "sending" };
      setSaveSteps([...updated]);

      try {
        const payload = {
          pitchId,
          dayOfWeek:     day.dayEN,
          startTime:     day.startTime,
          endTime:       day.endTime,
          priceOverride: Number(day.priceOverride),
          // Si ya existe la regla, enviar ruleId para hacer UPDATE en vez de DELETE+INSERT
          ...(day.ruleId ? { ruleId: day.ruleId } : {}),
        };

        console.log(`[ScheduleModal] POST ${day.dayEN}:`, JSON.stringify(payload));

        const res = await fetch("/api/availability-rules", {
          method:  "POST",
          headers: buildHeaders(),
          body:    JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Error ${res.status}`);
        }

        await res.json();
        updated[i] = { ...updated[i], status: "ok" };
      } catch (err) {
        updated[i] = {
          ...updated[i],
          status:   "error",
          errorMsg: err instanceof Error ? err.message : "Error desconocido",
        };
      }

      setSaveSteps([...updated]);

      // Pausa minima entre requests para que el usuario vea el progreso
      if (i < openDays.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    setSaveDone(true);

    // Si todo OK, recargar y cerrar automaticamente en 2s
    const anyError = updated.some((s) => s.status === "error");
    if (!anyError) {
      await fetchRules();
      setTimeout(() => {
        onClose();
        setSaveSteps([]);
        setIsSaving(false);
        setSaveDone(false);
      }, 1800);
    } else {
      setIsSaving(false);
    }
  };

  const handleProgressClose = () => {
    onClose();
    setSaveSteps([]);
    setIsSaving(false);
    setSaveDone(false);
  };

  if (!isOpen) return null;

  const isCompact  = selectedDayIndex !== null;
  const selectedDay = selectedDayIndex !== null ? schedule[selectedDayIndex] : null;
  const openCount  = schedule.filter((d) => d.isOpen).length;
  const showProgress = isSaving || (saveDone && saveSteps.length > 0);

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={!isSaving ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="relative flex h-full max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#1e3a28] bg-[#07111d] shadow-2xl shadow-black/60">

          {/* Overlay de progreso */}
          {showProgress && (
            <SaveProgressOverlay
              steps={saveSteps}
              allDone={saveDone}
              onClose={handleProgressClose}
            />
          )}

          {/* Cabecera */}
          <header className="flex items-start justify-between gap-4 border-b border-[#1e3a28] px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#4be176]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4be176]">
                  Horarios
                </span>
              </div>
              <h2
                id="schedule-modal-title"
                className="text-lg font-black text-[#dce5d9] sm:text-xl"
              >
                Configuracion de Horarios
              </h2>
              <p className="mt-0.5 text-xs text-[#6b7f6b]">
                {pitchName}{pitchType ? ` - ${pitchType}` : ""}
              </p>
            </div>
            <button
              ref={firstFocusRef}
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Cerrar modal"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5a7a5a] transition hover:bg-[#0d1a0f] hover:text-[#d7e8f2] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-16 text-[#4a5a4a]">
                <Loader2 className="h-5 w-5 animate-spin text-[#4be176]" />
                <span className="text-sm">Cargando horarios...</span>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/30 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">{loadError}</p>
              </div>
            )}

            {!isLoading && (
              <div className="flex flex-col gap-5">
                <WeekCalendar
                  schedule={schedule}
                  todayIndex={todayIndex}
                  selectedIndex={selectedDayIndex}
                  onSelectDay={(idx) =>
                    setSelectedDayIndex((prev) => (prev === idx ? null : idx))
                  }
                  now={now}
                  compact={isCompact}
                />

                {selectedDay !== null && selectedDayIndex !== null && (
                  <DayDetailForm
                    day={selectedDay}
                    index={selectedDayIndex}
                    dispatch={dispatch}
                    todayIndex={todayIndex}
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-[#1e3a28] bg-[#060f18] px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex gap-3">
              <button
                id="schedule-modal-cancel"
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-2xl border border-[#1e3a28] bg-transparent px-4 py-3 text-sm font-bold text-[#5a7a5a] transition hover:border-[#2d5c3a] hover:bg-[#0d1a0f] hover:text-[#d7e8f2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                id="schedule-modal-save"
                type="button"
                onClick={handleSave}
                disabled={isSaving || isLoading || openCount === 0}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#4be176] px-6 py-3 text-sm font-black text-[#021308] shadow-lg shadow-[#4be176]/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" />
                <span>
                  Guardar{openCount > 0 ? ` ${openCount} dia${openCount !== 1 ? "s" : ""}` : " Cambios"}
                </span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}