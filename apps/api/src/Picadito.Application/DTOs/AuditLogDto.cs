namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar un registro de auditoría en las respuestas de la API.
/// </summary>
public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO para crear un nuevo registro de auditoría.
/// </summary>
public class CreateAuditLogDto
{
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
}
