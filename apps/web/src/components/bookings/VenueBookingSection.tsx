"use client";

import { useState } from "react";
import { BookingCalendar, TimeSlot } from "./BookingCalendar";

interface VenueBookingSectionProps {
    pitches: any[];
}

// Mock available slots for demonstration (in reality, fetchen via API using pitchId and date)
const mockSlots: TimeSlot[] = [
    { id: "1", start_time: "18:00:00", end_time: "19:00:00", price: 20000, status: "available" },
    { id: "2", start_time: "19:00:00", end_time: "20:00:00", price: 25000, status: "available" },
    { id: "3", start_time: "20:00:00", end_time: "21:00:00", price: 30000, status: "booked" },
    { id: "4", start_time: "21:00:00", end_time: "22:00:00", price: 30000, status: "available" },
    { id: "5", start_time: "22:00:00", end_time: "23:00:00", price: 25000, status: "unavailable" },
];

export function VenueBookingSection({ pitches }: VenueBookingSectionProps) {
    const [selectedPitch, setSelectedPitch] = useState<any | null>(null);

    const handleBook = (slot: TimeSlot) => {
        // In a real app this would call a server action or trigger a checkout modal
        alert(`Buscando reservar ${selectedPitch?.name} a las ${slot.start_time.substring(0, 5)} por $${slot.price}`);
    };

    return (
        <div className="space-y-8" id="reservar">
            {!selectedPitch ? (
                <div className="text-center py-10 bg-card rounded-2xl border border-border/50 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-semibold mb-2">Reserva tu próxima partida</h3>
                    <p className="text-muted-foreground mb-6">Selecciona la cancha para ver los horarios disponibles.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {pitches.map((pitch) => (
                            <button
                                key={pitch.id}
                                onClick={() => setSelectedPitch(pitch)}
                                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-md"
                            >
                                Elegir {pitch.name}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold">
                            Horarios para <span className="text-primary">{selectedPitch.name}</span>
                        </h3>
                        <button
                            onClick={() => setSelectedPitch(null)}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                        >
                            Cambiar cancha
                        </button>
                    </div>
                    <BookingCalendar
                        pitchId={selectedPitch.id}
                        availableSlots={mockSlots}
                        onSelectSlot={handleBook}
                    />
                </div>
            )}
        </div>
    );
}
