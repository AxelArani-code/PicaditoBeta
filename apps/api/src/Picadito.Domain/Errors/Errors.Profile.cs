using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Profile
    {
        public static Error NotFound => Error.NotFound(
            "Profile.NotFound",
            "El perfil especificado no existe.");

        public static Error Forbidden => Error.Forbidden(
            "Profile.Forbidden",
            "No tienes permisos para modificar este perfil.");

        public static Error CannotDelete => Error.Conflict(
            "Profile.CannotDelete",
            "No se puede eliminar el perfil porque tiene reservas activas o pendientes.");

        public static Error UsernameTaken => Error.Conflict(
            "Profile.UsernameTaken",
            "El nombre de usuario ya está en uso.");

        public static Error AdminOnly => Error.Forbidden(
            "Profile.AdminOnly",
            "Solo los administradores pueden realizar esta acción.");
    }
}
