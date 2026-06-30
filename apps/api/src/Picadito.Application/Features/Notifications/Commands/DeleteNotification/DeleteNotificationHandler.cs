using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Notifications.Commands.DeleteNotification;

/// <summary>
/// Handler para eliminar una notificación.
/// Solo administradores pueden eliminar notificaciones.
/// </summary>
public class DeleteNotificationHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteNotificationHandler> logger)
{
    private readonly ILogger<DeleteNotificationHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, NotificationId: {NotificationId}", correlationId, request.Id))
        {
            _logger.LogInformation("Deleting notification. NotificationId: {NotificationId}", request.Id);

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            // Solo administradores pueden eliminar notificaciones
            if (!currentUserService.IsAdmin)
            {
                _logger.LogWarning(
                    "Non-admin user attempted to delete notification. UserId: {UserId}",
                    currentUserService.UserId.Value);
                return Error.Forbidden(description: "Solo los administradores pueden eliminar notificaciones.");
            }

            var notification = await notificationRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (notification == null)
            {
                _logger.LogWarning("Notification not found. NotificationId: {NotificationId}", request.Id);
                return DomainErrors.Notification.NotFound;
            }

            await notificationRepository.DeleteAsync(request.Id, cancellationToken);

            _logger.LogInformation(
                "Notification deleted successfully. NotificationId: {NotificationId}",
                notification.Id);

            return Result.Success;
        }
    }
}
