using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Notifications.Queries.GetAllNotifications;

/// <summary>
/// Handler para obtener las notificaciones del usuario autenticado.
/// La política RLS "Users can view own notifications" restringe la vista
/// a las notificaciones del usuario actual.
/// </summary>
public class GetAllNotificationsHandler(
    INotificationRepository notificationRepository,
    IValidator<GetAllNotificationsQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllNotificationsHandler> logger)
{
    private readonly ILogger<GetAllNotificationsHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<NotificationDto>>> Handle(GetAllNotificationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllNotifications requested: IsRead={IsRead}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.IsRead, request.PageNumber, request.PageSize);

        if (currentUserService.UserId is null)
        {
            _logger.LogWarning("Intento de acceso de usuario no autenticado.");
            return Error.Unauthorized(description: "Usuario no autenticado");
        }

        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Forzar el filtro por el usuario autenticado (política RLS)
        var userId = currentUserService.UserId.Value;

        var result = await notificationRepository.GetAllAsync(
            userId,
            request.IsRead,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllNotifications completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
            result.Value.PageNumber, result.Value.PageSize, result.Value.Items.Count, result.Value.TotalCount);

        return result.Value;
    }
}
