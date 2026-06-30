using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class VenueRating
    {
        public static Error NotFound => Error.NotFound(
            "VenueRating.NotFound",
            "La calificación no existe.");

        public static Error Forbidden => Error.Forbidden(
            "VenueRating.Forbidden",
            "No tienes permisos para realizar esta acción.");

        public static Error NotParticipant => Error.Forbidden(
            "VenueRating.NotParticipant",
            "Debes ser participante del partido para calificar.");

        public static Error AlreadyRated => Error.Conflict(
            "VenueRating.AlreadyRated",
            "Ya has calificado este partido.");
    }
}
