using System;

namespace Picadito.Application.Features.Notifications.Commands.UpdateNotification;

/// <summary>
/// Comando para marcar una notificación como leída/no leída.
/// </summary>
public class UpdateNotificationCommand
{
    public Guid Id { get; set; }

    /// <summary>
    /// Estado de lectura de la notificación.
    /// </summary>
    public bool IsRead { get; set; } = true;
}
