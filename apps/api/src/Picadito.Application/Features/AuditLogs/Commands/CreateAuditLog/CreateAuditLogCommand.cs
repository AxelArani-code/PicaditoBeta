using System;

namespace Picadito.Application.Features.AuditLogs.Commands.CreateAuditLog;

/// <summary>
/// Comando para crear un nuevo registro de auditoría.
/// </summary>
public class CreateAuditLogCommand
{
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;

    /// <summary>
    /// ID del usuario que realizó la acción. Opcional - si no se proporciona,
    /// se asignará el ID del usuario autenticado actual.
    /// </summary>
    public Guid? UserId { get; set; }
}
