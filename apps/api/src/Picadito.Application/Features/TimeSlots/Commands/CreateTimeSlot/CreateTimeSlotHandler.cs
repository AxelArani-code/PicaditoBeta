using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.TimeSlots.Commands.CreateTimeSlot;

/// <summary>
/// Manejador para la creación de un TimeSlot.
/// Valida permisos, reglas de negocio y persiste el turno.
/// </summary>
public class CreateTimeSlotHandler(
    ITimeSlotRepository timeSlotRepository,
    IValidator<CreateTimeSlotCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateTimeSlotHandler> logger)
{
    public async Task<ErrorOr<Guid>> Handle(CreateTimeSlotCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            logger.LogInformation(
                "Iniciando creación de TimeSlot para PitchId: {PitchId}, Date: {Date}",
                request.PitchId, request.Date);

            // 1. Validación del comando con FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("Validación fallida. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // 2. Verificar autenticación
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

            var isAdmin = currentUserService.IsAdmin;

            // 3. Solo venue_owner y admin pueden crear turnos
            if (userRole == UserRole.player)
            {
                logger.LogWarning("Player role no autorizado para crear turnos. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear turnos.");
            }

            // 4. Parsear fecha y horas
            if (!DateOnly.TryParse(request.Date, out var date))
            {
                logger.LogWarning("Formato de fecha inválido: {Date}", request.Date);
                return Error.Validation("Date", "La fecha no tiene un formato válido.");
            }

            if (!TimeSpan.TryParse(request.StartTime, out var startTime) ||
                !TimeSpan.TryParse(request.EndTime, out var endTime))
            {
                logger.LogWarning("Formato de hora inválido. StartTime: {StartTime}, EndTime: {EndTime}",
                    request.StartTime, request.EndTime);
                return Error.Validation("TimeFormat", "El formato de hora no es válido. Use HH:mm.");
            }

            // 5. Validar que startTime < endTime
            if (startTime >= endTime)
            {
                logger.LogWarning("StartTime debe ser anterior a EndTime. StartTime: {StartTime}, EndTime: {EndTime}",
                    startTime, endTime);
                return DomainErrors.TimeSlot.InvalidTimeRange;
            }

            // 6. Verificar que la cancha existe y está activa
            var pitchExists = await timeSlotRepository.PitchExistsAndIsActiveAsync(
                request.PitchId, cancellationToken);
            if (!pitchExists)
            {
                logger.LogWarning(
                    "Intento de crear turno para una cancha inexistente o eliminada. PitchId: {PitchId}",
                    request.PitchId);
                return DomainErrors.Pitch.NotFound;
            }

            // 7. Verificar propiedad de la cancha (solo si no es admin)
            if (!isAdmin)
            {
                var isPitchOwner = await timeSlotRepository.IsPitchOwnerAsync(
                    request.PitchId, userId, cancellationToken);
                if (!isPitchOwner)
                {
                    logger.LogWarning(
                        "El usuario no es dueño de la cancha. UserId: {UserId}, PitchId: {PitchId}",
                        userId, request.PitchId);
                    return DomainErrors.TimeSlot.PitchForbidden;
                }
            }

            // 8. Validar que no haya superposición de horarios
            var hasOverlap = await timeSlotRepository.HasOverlappingSlotAsync(
                request.PitchId, date, startTime, endTime, cancellationToken);
            if (hasOverlap)
            {
                logger.LogWarning(
                    "Ya existe un turno en el mismo horario. PitchId: {PitchId}, Date: {Date}, StartTime: {StartTime}, EndTime: {EndTime}",
                    request.PitchId, request.Date, request.StartTime, request.EndTime);
                return DomainErrors.TimeSlot.OverlappingSlot;
            }

            // 9. Crear la entidad de dominio
            var timeSlot = new TimeSlot(
                request.PitchId,
                date,
                startTime,
                endTime,
                request.Price);

            // 10. Persistir
            var result = await timeSlotRepository.AddAsync(timeSlot, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            logger.LogInformation(
                "TimeSlot creado exitosamente. SlotId: {SlotId}, PitchId: {PitchId}, Date: {Date}, StartTime: {StartTime}",
                result.Value, timeSlot.PitchId, timeSlot.Date, timeSlot.StartTime);

            return result.Value;
        }
    }
}
