using System;

namespace Picadito.Domain.Entities;

/// <summary>
/// Entidad que representa una notificación para un usuario.
/// Mapea a la tabla 'notifications' de la base de datos.
/// </summary>
public class Notification
{
    public Guid Id { get; set; }

    /// <summary>
    /// ID del usuario propietario de la notificación.
    /// </summary>
    public Guid UserId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de notificación (ej. booking_confirmed, booking_rejected, etc.).
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Indica si la notificación ha sido leída.
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Enlace opcional al que redirige la notificación.
    /// </summary>
    public string? Link { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Profile User { get; set; } = null!;
}
