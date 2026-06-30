using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class TeamMember
    {
        public static Error NotFound => Error.NotFound(
            "TeamMember.NotFound",
            "El miembro del equipo no existe.");

        public static Error Forbidden => Error.Forbidden(
            "TeamMember.Forbidden",
            "No tienes permisos para gestionar este miembro.");

        public static Error AlreadyMember => Error.Conflict(
            "TeamMember.AlreadyMember",
            "El usuario ya es miembro de este equipo.");

        public static Error CannotRemoveCaptain => Error.Forbidden(
            "TeamMember.CannotRemoveCaptain",
            "No puedes eliminar al capitán del equipo. Transfiere la capitanía primero.");
    }
}
