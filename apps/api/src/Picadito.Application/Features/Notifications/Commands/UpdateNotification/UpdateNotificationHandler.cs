using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Notifications.Commands.UpdateNotification;

/// <summary>
/// Handler para marcar una notificación como leída.
/// La política RLS "Users can update own notifications" permite al usuario
/// modificar solo sus propias notificaciones.
/// </summary>
public class UpdateNotificationHandler(
    INotificationRepository notificationRepository,
    IValidator<UpdateNotificationCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateNotificationHandler> logger)
{
    private readonly ILogger<UpdateNotificationHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateNotificationCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, NotificationId: {NotificationId}", correlationId, request.Id))
        {
            _logger.LogInformation("Updating notification. NotificationId: {NotificationId}, IsRead: {IsRead}", request.Id, request.IsRead);

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;
            var isAdmin = currentUserService.IsAdmin;

            var notification = await notificationRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (notification == null)
            {
                _logger.LogWarning("Notification not found. NotificationId: {NotificationId}", request.Id);
                return DomainErrors.Notification.NotFound;
            }

            // La política RLS "Users can update own notifications" permite al usuario
            // modificar sus propias notificaciones. Admin tiene bypass.
            if (!isAdmin && notification.UserId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized update attempt. UserId: {UserId}, NotificationUserId: {NotificationUserId}, NotificationId: {NotificationId}",
                    userId, notification.UserId, request.Id);
                return DomainErrors.Notification.Forbidden;
            }

            notification.IsRead = request.IsRead;

            var result = await notificationRepository.UpdateAsync(notification, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Notification updated successfully. NotificationId: {NotificationId}, IsRead: {IsRead}",
                notification.Id, notification.IsRead);

            return Result.Success;
        }
    }
}
