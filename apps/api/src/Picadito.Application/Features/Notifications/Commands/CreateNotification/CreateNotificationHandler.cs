using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Notifications.Commands.CreateNotification;

/// <summary>
/// Handler para crear una notificación.
/// Solo administradores pueden crear notificaciones manualmente.
/// </summary>
public class CreateNotificationHandler(
    INotificationRepository notificationRepository,
    IValidator<CreateNotificationCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateNotificationHandler> logger)
{
    private readonly ILogger<CreateNotificationHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Creating notification for UserId: {UserId}, Type: {Type}", request.UserId, request.Type);

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

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            // Solo administradores pueden crear notificaciones manualmente
            if (!currentUserService.IsAdmin)
            {
                _logger.LogWarning(
                    "Non-admin user attempted to create notification. UserId: {UserId}",
                    currentUserService.UserId.Value);
                return Error.Forbidden(description: "Solo los administradores pueden crear notificaciones.");
            }

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                Link = request.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            var result = await notificationRepository.AddAsync(notification, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Notification created successfully. NotificationId: {NotificationId}, UserId: {UserId}, Type: {Type}",
                result.Value, notification.UserId, notification.Type);

            return result.Value;
        }
    }
}
