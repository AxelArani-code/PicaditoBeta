using System;

namespace Picadito.Application.Features.Notifications.Commands.DeleteNotification;

/// <summary>
/// Comando para eliminar una notificación.
/// </summary>
public class DeleteNotificationCommand
{
    public Guid Id { get; set; }
}
