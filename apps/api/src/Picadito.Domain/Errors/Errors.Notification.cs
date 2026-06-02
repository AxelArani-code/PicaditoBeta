using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class Notification
    {
        public static Error NotFound => Error.NotFound(
            "Notification.NotFound",
            "La notificación no existe.");

        public static Error Forbidden => Error.Forbidden(
            "Notification.Forbidden",
            "No tienes permisos para acceder a esta notificación.");
    }
}
