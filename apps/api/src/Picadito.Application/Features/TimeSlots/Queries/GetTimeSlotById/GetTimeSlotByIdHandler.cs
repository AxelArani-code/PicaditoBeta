using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.TimeSlots.Queries.GetTimeSlotById;

/// <summary>
/// Manejador para la consulta de un TimeSlot por ID.
/// Aplica seguridad basada en roles.
/// </summary>
public class GetTimeSlotByIdHandler(
    ITimeSlotRepository timeSlotRepository,
    IValidator<GetTimeSlotByIdQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetTimeSlotByIdHandler> logger)
{
    public async Task<ErrorOr<TimeSlotDto>> Handle(
        GetTimeSlotByIdQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (logger.BeginScope("CorrelationId: {CorrelationId}, SlotId: {SlotId}", correlationId, request.Id))
        {
            logger.LogInformation("Obteniendo TimeSlot por ID. SlotId: {SlotId}", request.Id);

            if (currentUserService.UserId is null)
            {
                logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            // Validar query
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("Validación fallida. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Delegar al repositorio
            var result = await timeSlotRepository.GetByIdAsync(
                request.Id, userId, userRole, cancellationToken);

            if (result.IsError)
            {
                logger.LogWarning(
                    "TimeSlot no encontrado o acceso denegado. SlotId: {SlotId}, UserId: {UserId}",
                    request.Id, userId);
                return result.Errors;
            }

            logger.LogInformation(
                "TimeSlot recuperado exitosamente. SlotId: {SlotId}, UserId: {UserId}",
                request.Id, userId);

            return result.Value;
        }
    }
}
