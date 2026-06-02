using System;

namespace Picadito.Domain.Entities;

/// <summary>
/// Representa un registro de auditoría para trazar las acciones realizadas en el sistema.
/// Es una entidad inmutable (solo creación y lectura).
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property: AuditLog pertenece a un Profile (opcional)
    public virtual Profile? User { get; set; }
}
