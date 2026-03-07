"use client";

import { useState } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeSlot {
    id: string;
    start_time: string;
    end_time: string;
    price: number;
    status: "available" | "booked" | "unavailable";
}

interface BookingCalendarProps {
    pitchId: string;
    availableSlots: TimeSlot[];
    onSelectSlot: (slot: TimeSlot) => void;
}

export function BookingCalendar({ pitchId, availableSlots, onSelectSlot }: BookingCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    // Generate next 7 days
    const nextDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

    // In a real app, slots would be fetched/filtered by `selectedDate`
    // Here we just use the passed slots as a mock filter
    const slotsForDate = availableSlots.filter(
        (slot) => slot.status !== "unavailable"
    ); // Normally we'd check slot.date === selectedDate

    const handleSlotClick = (slot: TimeSlot) => {
        if (slot.status === "available") {
            setSelectedSlotId(slot.id);
            onSelectSlot(slot);
        }
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in">
            {/* Date Picker (Horizontal Week) */}
            <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Selecciona una fecha</h3>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {nextDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex min-w-[70px] flex-col items-center justify-center rounded-lg border p-3 transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <span className="text-xs font-medium uppercase">
                                    {format(day, "EEE", { locale: es })}
                                </span>
                                <span className="text-xl font-bold">
                                    {format(day, "dd")}
                                </span>
                                <span className="text-xs opacity-80">
                                    {format(day, "MMM", { locale: es })}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            <div className="p-4 sm:p-6 bg-muted/20">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Horarios disponibles</h3>
                </div>

                {slotsForDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay horarios disponibles para esta fecha.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {slotsForDate.map((slot) => {
                            const isAvailable = slot.status === "available";
                            const isSelected = selectedSlotId === slot.id;

                            return (
                                <button
                                    key={slot.id}
                                    disabled={!isAvailable}
                                    onClick={() => handleSlotClick(slot)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all",
                                        isAvailable
                                            ? "hover:border-primary hover:bg-primary/5 cursor-pointer"
                                            : "opacity-50 cursor-not-allowed bg-muted",
                                        isSelected
                                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                                            : "border-border"
                                    )}
                                >
                                    <span className="text-lg font-bold">
                                        {slot.start_time.substring(0, 5)}
                                    </span>
                                    <span className={cn(
                                        "text-xs mt-1",
                                        isAvailable ? "text-green-600 dark:text-green-400 font-medium" : "text-destructive"
                                    )}>
                                        {isAvailable ? `$${slot.price.toLocaleString('es-AR')}` : "Ocupado"}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5 animate-in zoom-in">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
