using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class AvailabilityRule
    {
        public static Error NotFound => Error.NotFound(
            "AvailabilityRule.NotFound",
            "La regla de disponibilidad especificada no existe.");

        public static Error Forbidden => Error.Forbidden(
            "AvailabilityRule.Forbidden",
            "No tienes permisos para gestionar esta regla de disponibilidad.");

        public static Error PitchNotFound => Error.NotFound(
            "AvailabilityRule.PitchNotFound",
            "La cancha especificada no existe.");

        public static Error PitchForbidden => Error.Forbidden(
            "AvailabilityRule.PitchForbidden",
            "No tienes permisos para gestionar reglas de disponibilidad de esta cancha.");

        public static Error InvalidTimeRange => Error.Validation(
            "AvailabilityRule.InvalidTimeRange",
            "La hora de inicio debe ser anterior a la hora de fin.");
    }
}
