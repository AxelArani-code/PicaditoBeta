using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Notifications.Queries.GetNotificationById;

/// <summary>
/// Handler para obtener una notificación por su ID.
/// La política RLS "Users can view own notifications" restringe la vista
/// a las notificaciones del usuario actual.
/// </summary>
public class GetNotificationByIdHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService,
    ILogger<GetNotificationByIdHandler> logger)
{
    private readonly ILogger<GetNotificationByIdHandler> _logger = logger;

    public async Task<ErrorOr<NotificationDto>> Handle(GetNotificationByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetNotificationById requested: NotificationId={NotificationId}", request.Id);

        if (currentUserService.UserId is null)
        {
            _logger.LogWarning("Intento de acceso de usuario no autenticado.");
            return Error.Unauthorized(description: "Usuario no autenticado");
        }

        var userId = currentUserService.UserId.Value;
        var isAdmin = currentUserService.IsAdmin;

        var notification = await notificationRepository.GetByIdAsync(request.Id, cancellationToken);

        if (notification == null)
        {
            _logger.LogWarning("Notification not found. NotificationId: {NotificationId}", request.Id);
            return DomainErrors.Notification.NotFound;
        }

        // La política RLS "Users can view own notifications" permite al usuario
        // ver solo sus propias notificaciones. Admin tiene bypass.
        if (!isAdmin && notification.UserId != userId)
        {
            _logger.LogWarning(
                "Unauthorized access attempt. UserId: {UserId}, NotificationUserId: {NotificationUserId}, NotificationId: {NotificationId}",
                userId, notification.UserId, request.Id);
            return DomainErrors.Notification.Forbidden;
        }

        _logger.LogInformation(
            "GetNotificationById completed: NotificationId={NotificationId}, UserId={UserId}",
            notification.Id, notification.UserId);

        return notification;
    }
}
