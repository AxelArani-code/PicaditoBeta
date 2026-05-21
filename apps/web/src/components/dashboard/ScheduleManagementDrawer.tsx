"use client";

import { useState, useEffect, useRef } from "react";
import {
    X,
    Calendar,
    Copy,
    Cloud,
    Zap,
    CheckCircle,
} from "lucide-react";

interface DaySchedule {
    day: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
    basePrice: number;
    valleyPrice: number;
    peakPrice: number;
}

interface ScheduleManagementDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    pitchName?: string;
    pitchType?: string;
}

export function ScheduleManagementDrawer({
    isOpen,
    onClose,
    pitchName = "Cancha 01",
    pitchType = "Fútbol 5",
}: ScheduleManagementDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const [schedule, setSchedule] = useState<DaySchedule[]>([
        {
            day: "Lunes",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Martes",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Miércoles",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Jueves",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Viernes",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Sábado",
            isOpen: true,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
        {
            day: "Domingo",
            isOpen: false,
            startTime: "08:00",
            endTime: "23:00",
            basePrice: 50,
            valleyPrice: 35,
            peakPrice: 65,
        },
    ]);

    // Cuando se abre el drawer, hacer scroll y focus
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            // Scroll suave hacia el drawer
            drawerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            // Hacer focus en el contenedor
            drawerRef.current.focus();
            // Prevenir scroll del body
            document.body.style.overflow = "hidden";
        } else {
            // Restaurar scroll del body
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Cerrar con tecla ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const updateDay = (index: number, field: keyof DaySchedule, value: any) => {
        const updated = [...schedule];
        updated[index] = { ...updated[index], [field]: value };
        setSchedule(updated);
    };

    const replicateSchedule = () => {
        if (schedule.length > 0) {
            const firstDay = schedule[0];
            const updated = schedule.map((day) => ({
                ...day,
                isOpen: firstDay.isOpen,
                startTime: firstDay.startTime,
                endTime: firstDay.endTime,
                basePrice: firstDay.basePrice,
                valleyPrice: firstDay.valleyPrice,
                peakPrice: firstDay.peakPrice,
            }));
            setSchedule(updated);
        }
    };

    const handleSave = () => {
        console.log("Guardando horarios:", schedule);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
                onClick={onClose}
            />

            {/* Side Panel Drawer */}
            <div
                ref={drawerRef}
                tabIndex={-1}
                className="fixed right-0 top-0 z-[60] flex h-screen w-full md:max-w-3xl flex-col border-l border-[#3d4a3d]/20 bg-[#1a221a]/90 shadow-2xl backdrop-blur-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-right"
            >
                {/* Header */}
                <div className="border-b border-[#3d4a3d]/10 p-4 sm:p-6 md:p-8">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#4be176] shrink-0" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#4be176]">
                                    Configuración
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#dce5d9] break-words">
                                Configuración de Horarios
                            </h2>
                            <p className="text-xs sm:text-sm text-[#bccbb9] font-medium break-words">
                                {pitchName} - {pitchType}
                            </p>
                        </div>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all hover:bg-[#2f372e] group active:scale-95 shrink-0"
                            title="Cerrar (ESC)"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6 text-[#dce5d9] group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8">
                    {/* Weekly Schedule Grid */}
                    <section>
                        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                            <h3 className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold text-[#dce5d9]">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#21c45d] shrink-0" />
                                Cronograma Semanal
                            </h3>
                            <button
                                onClick={replicateSchedule}
                                className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#4be176] hover:underline transition-all whitespace-nowrap"
                            >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                REPLICAR
                            </button>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            {schedule.map((day, idx) => (
                                <div
                                    key={day.day}
                                    className={`space-y-2 p-3 sm:p-4 rounded-2xl border transition-all ${
                                        day.isOpen
                                            ? "bg-[#242c24]/60 border-[#3d4a3d]/20"
                                            : "bg-[#161d16]/80 border-[#3d4a3d]/40 border-dashed"
                                    }`}
                                >
                                    {/* Mobile Layout */}
                                    <div className="md:hidden space-y-2">
                                        {/* Day Name + Toggle */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className={`font-bold text-xs sm:text-sm ${
                                                day.isOpen ? "text-[#dce5d9]" : "text-[#ffb4ab]"
                                            }`}>
                                                {day.day}
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={day.isOpen}
                                                    onChange={(e) =>
                                                        updateDay(idx, "isOpen", e.target.checked)
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className={`w-8 h-5 rounded-full peer-checked:bg-[#4be176] ${
                                                        day.isOpen ? "bg-[#4be176]" : "bg-[#2f372e]"
                                                    } transition-all`}
                                                />
                                                <span className={`text-[8px] font-bold uppercase ml-2 ${
                                                    day.isOpen
                                                        ? "text-[#4be176]"
                                                        : "text-[#ffb4ab]"
                                                }`}>
                                                    {day.isOpen ? "ON" : "OFF"}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Time + Prices in 2 rows */}
                                        <div className={`space-y-2 ${!day.isOpen && "opacity-50 pointer-events-none"}`}>
                                            {/* Time Range */}
                                            <div className="flex items-center gap-1 text-xs">
                                                <input
                                                    type="time"
                                                    value={day.startTime}
                                                    onChange={(e) => updateDay(idx, "startTime", e.target.value)}
                                                    disabled={!day.isOpen}
                                                    className="w-14 bg-[#0e150e] border border-[#3d4a3d]/60 text-[#dce5d9] text-xs rounded px-1.5 py-1 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                                />
                                                <span className="text-[#869585]">/</span>
                                                <input
                                                    type="time"
                                                    value={day.endTime}
                                                    onChange={(e) => updateDay(idx, "endTime", e.target.value)}
                                                    disabled={!day.isOpen}
                                                    className="w-14 bg-[#0e150e] border border-[#3d4a3d]/60 text-[#dce5d9] text-xs rounded px-1.5 py-1 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                                />
                                            </div>

                                            {/* Prices - 3 columns */}
                                            <div className="grid grid-cols-3 gap-1 text-[10px]">
                                                <div className="relative">
                                                    <span className="absolute left-1 top-0.5 text-[7px] font-black text-[#4be176] uppercase opacity-60">B</span>
                                                    <input
                                                        type="number"
                                                        value={day.basePrice}
                                                        onChange={(e) => updateDay(idx, "basePrice", parseInt(e.target.value))}
                                                        disabled={!day.isOpen}
                                                        className="w-full pt-3 pb-0.5 pl-1 pr-0.5 bg-[#0e150e] border-none text-xs rounded font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                                    />
                                                    <span className="absolute right-0.5 bottom-0.5 text-[8px] text-[#869585]">$</span>
                                                </div>

                                                <div className="relative">
                                                    <span className="absolute left-1 top-0.5 text-[7px] font-black text-[#adc6ff] uppercase opacity-60">V</span>
                                                    <input
                                                        type="number"
                                                        value={day.valleyPrice}
                                                        onChange={(e) => updateDay(idx, "valleyPrice", parseInt(e.target.value))}
                                                        disabled={!day.isOpen}
                                                        className="w-full pt-3 pb-0.5 pl-1 pr-0.5 bg-[#0e150e] border-none text-xs rounded font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                                    />
                                                    <span className="absolute right-0.5 bottom-0.5 text-[8px] text-[#869585]">$</span>
                                                </div>

                                                <div className="relative">
                                                    <span className="absolute left-1 top-0.5 text-[7px] font-black text-[#ffb4aa] uppercase opacity-60">P</span>
                                                    <input
                                                        type="number"
                                                        value={day.peakPrice}
                                                        onChange={(e) => updateDay(idx, "peakPrice", parseInt(e.target.value))}
                                                        disabled={!day.isOpen}
                                                        className="w-full pt-3 pb-0.5 pl-1 pr-0.5 bg-[#0e150e] border-none text-xs rounded font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                                    />
                                                    <span className="absolute right-0.5 bottom-0.5 text-[8px] text-[#869585]">$</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                    {/* Day Name */}
                                    <div
                                        className={`col-span-2 font-bold text-sm ${
                                            day.isOpen ? "text-[#dce5d9]" : "text-[#ffb4ab]"
                                        }`}
                                    >
                                        {day.day}
                                    </div>

                                    {/* Toggle Open/Closed */}
                                    <div className="col-span-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={day.isOpen}
                                                onChange={(e) =>
                                                    updateDay(idx, "isOpen", e.target.checked)
                                                }
                                                className="sr-only peer"
                                            />
                                            <div
                                                className={`w-11 h-6 rounded-full peer-checked:bg-[#4be176] ${
                                                    day.isOpen ? "bg-[#4be176]" : "bg-[#2f372e]"
                                                } transition-all`}
                                            />
                                            <span
                                                className={`ml-3 text-xs font-bold uppercase ${
                                                    day.isOpen
                                                        ? "text-[#4be176]"
                                                        : "text-[#ffb4ab]"
                                                }`}
                                            >
                                                {day.isOpen ? "ABIERTO" : "CERRADO"}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Time Range */}
                                    <div
                                        className={`col-span-4 flex items-center gap-2 ${
                                            !day.isOpen && "opacity-50 pointer-events-none"
                                        }`}
                                    >
                                        <input
                                            type="time"
                                            value={day.startTime}
                                            onChange={(e) =>
                                                updateDay(idx, "startTime", e.target.value)
                                            }
                                            disabled={!day.isOpen}
                                            className="w-full bg-[#0e150e] border border-[#3d4a3d]/60 text-[#dce5d9] text-xs rounded-lg p-2.5 focus:ring-[#4be176] focus:border-[#4be176] focus:outline-none disabled:opacity-50"
                                        />
                                        <span className="text-[#869585]">/</span>
                                        <input
                                            type="time"
                                            value={day.endTime}
                                            onChange={(e) =>
                                                updateDay(idx, "endTime", e.target.value)
                                            }
                                            disabled={!day.isOpen}
                                            className="w-full bg-[#0e150e] border border-[#3d4a3d]/60 text-[#dce5d9] text-xs rounded-lg p-2.5 focus:ring-[#4be176] focus:border-[#4be176] focus:outline-none disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Prices */}
                                    <div
                                        className={`col-span-4 flex gap-1 ${
                                            !day.isOpen && "opacity-50 pointer-events-none"
                                        }`}
                                    >
                                        {/* Base Price */}
                                        <div className="relative w-full">
                                            <span className="absolute left-2 top-1 text-[8px] font-black text-[#4be176] uppercase opacity-60">
                                                Base
                                            </span>
                                            <input
                                                type="number"
                                                value={day.basePrice}
                                                onChange={(e) =>
                                                    updateDay(idx, "basePrice", parseInt(e.target.value))
                                                }
                                                disabled={!day.isOpen}
                                                className="w-full pt-4 pb-1 pl-2 bg-[#0e150e] border-none text-xs rounded-lg font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                            />
                                            <span className="absolute right-1 bottom-1 text-[10px] text-[#869585]">$</span>
                                        </div>

                                        {/* Valley Price */}
                                        <div className="relative w-full">
                                            <span className="absolute left-2 top-1 text-[8px] font-black text-[#adc6ff] uppercase opacity-60">
                                                Valle
                                            </span>
                                            <input
                                                type="number"
                                                value={day.valleyPrice}
                                                onChange={(e) =>
                                                    updateDay(idx, "valleyPrice", parseInt(e.target.value))
                                                }
                                                disabled={!day.isOpen}
                                                className="w-full pt-4 pb-1 pl-2 bg-[#0e150e] border-none text-xs rounded-lg font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                            />
                                            <span className="absolute right-1 bottom-1 text-[10px] text-[#869585]">$</span>
                                        </div>

                                        {/* Peak Price */}
                                        <div className="relative w-full">
                                            <span className="absolute left-2 top-1 text-[8px] font-black text-[#ffb4aa] uppercase opacity-60">
                                                Pico
                                            </span>
                                            <input
                                                type="number"
                                                value={day.peakPrice}
                                                onChange={(e) =>
                                                    updateDay(idx, "peakPrice", parseInt(e.target.value))
                                                }
                                                disabled={!day.isOpen}
                                                className="w-full pt-4 pb-1 pl-2 bg-[#0e150e] border-none text-xs rounded-lg font-bold text-[#dce5d9] focus:ring-2 focus:ring-[#4be176] focus:outline-none disabled:opacity-50"
                                            />
                                            <span className="absolute right-1 bottom-1 text-[10px] text-[#869585]">$</span>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Dynamic Pricing Section */}
                    <section className="rounded-3xl bg-[#242c24]/40 border border-[#4be176]/10 p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0566d9] text-[#adc6ff]">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#dce5d9]">
                                    Reglas de Precios Dinámicos
                                </h3>
                                <p className="text-xs text-[#bccbb9]">
                                    Ajuste automático de tarifas basado en demanda y clima.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Weather Rule */}
                            <div className="flex items-center justify-between rounded-2xl bg-[#0e150e]/60 p-4">
                                <div className="flex items-center gap-4">
                                    <Cloud className="h-5 w-5 text-[#adc6ff]" />
                                    <div>
                                        <p className="text-sm font-bold text-[#dce5d9]">
                                            Inclemencia Climática
                                        </p>
                                        <p className="text-[10px] text-[#bccbb9]">
                                            Reducir tarifa base un 15% en caso de lluvia.
                                        </p>
                                    </div>
                                </div>
                                <button className="text-[#4be176] font-bold text-xs hover:text-[#6bfe8f] transition">
                                    CONFIGURAR
                                </button>
                            </div>

                            {/* Peak Hours Rule */}
                            <div className="flex items-center justify-between rounded-2xl bg-[#0e150e]/60 p-4">
                                <div className="flex items-center gap-4">
                                    <Zap className="h-5 w-5 text-[#adc6ff]" />
                                    <div>
                                        <p className="text-sm font-bold text-[#dce5d9]">
                                            Horas de Alta Demanda
                                        </p>
                                        <p className="text-[10px] text-[#bccbb9]">
                                            Incrementar 20% si la ocupación es &gt; 90%.
                                        </p>
                                    </div>
                                </div>
                                <button className="text-[#4be176] font-bold text-xs hover:text-[#6bfe8f] transition">
                                    CONFIGURAR
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-t border-[#3d4a3d]/10 bg-[#161d16]/50 p-4 sm:p-6 md:p-8">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-[#3d4a3d] px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-[#bccbb9] transition hover:bg-[#242c24]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 sm:flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-[#4be176] px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-black text-[#002109] shadow-xl shadow-[#4be176]/20 transition hover:brightness-110 active:scale-95"
                    >
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Guardar Cambios</span>
                    </button>
                </div>
            </div>
        </>
    );
}
