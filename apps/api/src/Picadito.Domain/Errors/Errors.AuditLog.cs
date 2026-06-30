using System;
using ErrorOr;

namespace Picadito.Domain.Errors;

public static partial class DomainErrors
{
    public static class AuditLog
    {
        public static Error NotFound => Error.NotFound(
            "AuditLog.NotFound",
            "El registro de auditoría no existe.");

        public static Error Forbidden => Error.Forbidden(
            "AuditLog.Forbidden",
            "No tienes permisos para acceder a este registro de auditoría.");
    }
}
