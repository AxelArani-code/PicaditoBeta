using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class TimeSlot
    {
        public static Error NotFound => Error.NotFound(
            "TimeSlot.NotFound",
            "El turno especificado no existe.");

        public static Error Forbidden => Error.Forbidden(
            "TimeSlot.Forbidden",
            "No tienes permisos para gestionar este turno.");

        public static Error PitchNotFound => Error.NotFound(
            "TimeSlot.PitchNotFound",
            "La cancha especificada no existe.");

        public static Error PitchForbidden => Error.Forbidden(
            "TimeSlot.PitchForbidden",
            "No tienes permisos para gestionar turnos de esta cancha.");

        public static Error InvalidTimeRange => Error.Validation(
            "TimeSlot.InvalidTimeRange",
            "La hora de inicio debe ser anterior a la hora de fin.");

        public static Error OverlappingSlot => Error.Conflict(
            "TimeSlot.OverlappingSlot",
            "Ya existe un turno en el mismo horario para esta cancha.");
    }
}
