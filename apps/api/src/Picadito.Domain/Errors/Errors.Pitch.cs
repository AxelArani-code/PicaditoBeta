using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Pitch
    {
        public static Error VenueNotFound => Error.NotFound(
            "Pitch.VenueNotFound",
            "El complejo deportivo especificado no existe.");

        public static Error VenueForbidden => Error.Forbidden(
            "Pitch.VenueForbidden",
            "No tienes permisos para agregar canchas a este complejo deportivo.");

        public static Error AlreadyExists => Error.Conflict(
            "Pitch.AlreadyExists",
            "Ya existe una cancha con ese nombre en el complejo deportivo.");
    }
}
