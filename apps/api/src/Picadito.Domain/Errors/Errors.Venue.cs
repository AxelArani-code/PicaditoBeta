using System;
using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Venue
    {
        public static Error NotFound => Error.NotFound(
            "Venue.NotFound",
            "El complejo deportivo no existe.");

        public static Error Forbidden => Error.Forbidden(
            "Venue.Forbidden",
            "No tienes permisos para modificar este complejo deportivo.");

        public static Error AlreadyExists => Error.Conflict(
            "Venue.AlreadyExists",
            "Ya existe un complejo deportivo con ese nombre.");

        public static Error InvalidOwner => Error.Forbidden(
            "Venue.InvalidOwner",
            "Solo el propietario del complejo puede realizar esta acción.");
    }
}