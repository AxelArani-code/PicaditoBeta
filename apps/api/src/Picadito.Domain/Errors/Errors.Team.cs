using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Team
    {
        /// <summary>
        /// Error cuando no se encuentra el equipo solicitado.
        /// </summary>
        public static Error NotFound => Error.NotFound(
            "Team.NotFound",
            "El equipo no existe.");

        /// <summary>
        /// Error cuando el usuario no tiene permisos para modificar el equipo.
        /// </summary>
        public static Error Forbidden => Error.Forbidden(
            "Team.Forbidden",
            "No tienes permisos para modificar este equipo.");

        /// <summary>
        /// Error cuando ya existe un equipo con el mismo nombre.
        /// </summary>
        public static Error AlreadyExists => Error.Conflict(
            "Team.AlreadyExists",
            "Ya existe un equipo con ese nombre.");
    }
}
