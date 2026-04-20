using System;
using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors {
    public static class Booking {
        public static Error NotFound => Error.NotFound("Booking.NotFound", "El TimeSlot no existe.");
        public static Error NotAvailable => Error.Conflict("Booking.NotAvailable", "El turno ya no está disponible.");
        public static Error SlotAlreadyTaken => Error.Conflict(
            code: "Booking.SlotAlreadyTaken",
            description: "Este horario ya tiene una reserva pendiente o confirmada.");
    }
}
