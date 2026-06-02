using System;

namespace Picadito.Application.Features.Notifications.Commands.CreateNotification;

/// <summary>
/// Comando para crear una notificación.
/// Solo los administradores pueden crear notificaciones directamente.
/// </summary>
public class CreateNotificationCommand
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Link { get; set; }
}
