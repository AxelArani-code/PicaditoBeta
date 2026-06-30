using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Match
    {
        public static Error NotFound => Error.NotFound(
            "Match.NotFound",
            "El partido especificado no existe.");

        public static Error Forbidden => Error.Forbidden(
            "Match.Forbidden",
            "No tienes permisos para gestionar este partido.");

        public static Error BookingNotFound => Error.NotFound(
            "Match.BookingNotFound",
            "La reserva especificada no existe.");

        public static Error BookingAlreadyHasMatch => Error.Conflict(
            "Match.BookingAlreadyHasMatch",
            "La reserva ya tiene un partido asociado.");

        public static Error BookingNotConfirmed => Error.Conflict(
            "Match.BookingNotConfirmed",
            "Solo se pueden crear partidos para reservas confirmadas.");

        public static Error VenueForbidden => Error.Forbidden(
            "Match.VenueForbidden",
            "No tienes permisos para gestionar partidos de este complejo deportivo.");
    }
}
