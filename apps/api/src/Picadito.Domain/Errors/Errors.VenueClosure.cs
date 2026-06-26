using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class VenueClosure
    {
        public static Error NotFound => Error.NotFound(
            "VenueClosure.NotFound",
            "El cierre especificado no existe.");

        public static Error Forbidden => Error.Forbidden(
            "VenueClosure.Forbidden",
            "No tienes permisos para gestionar este cierre.");

        public static Error PitchNotFound => Error.NotFound(
            "VenueClosure.PitchNotFound",
            "La cancha especificada no existe.");

        public static Error PitchForbidden => Error.Forbidden(
            "VenueClosure.PitchForbidden",
            "No tienes permisos para gestionar cierres de esta cancha.");

        public static Error InvalidTimeRange => Error.Validation(
            "VenueClosure.InvalidTimeRange",
            "La hora de inicio debe ser anterior a la hora de fin.");

        public static Error PastDate => Error.Validation(
            "VenueClosure.PastDate",
            "La fecha de cierre no puede ser anterior a la fecha actual.");
    }
}
