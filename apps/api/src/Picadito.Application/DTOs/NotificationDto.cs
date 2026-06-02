namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar una notificación en las respuestas de la API.
/// </summary>
public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO para crear una notificación (solo administradores o sistema).
/// </summary>
public class CreateNotificationDto
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Link { get; set; }
}

/// <summary>
/// DTO para marcar una notificación como leída.
/// </summary>
public class UpdateNotificationDto
{
    public bool IsRead { get; set; } = true;
}
