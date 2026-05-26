using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.TimeSlots.Queries.GetAllTimeSlots;

/// <summary>
/// Manejador para la consulta paginada de TimeSlots.
/// Aplica filtros por cancha y fecha, y seguridad basada en roles.
/// </summary>
public class GetAllTimeSlotsHandler(
    ITimeSlotRepository timeSlotRepository,
    IValidator<GetAllTimeSlotsQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllTimeSlotsHandler> logger)
{
    public async Task<ErrorOr<PagedResponse<TimeSlotDto>>> Handle(
        GetAllTimeSlotsQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        if (currentUserService.UserId is null)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userId = currentUserService.UserId.Value;

        if (currentUserService.UserRole is not { } userRole)
        {
            return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
        }

        logger.LogInformation(
            "GetAllTimeSlots request iniciado: UserId={UserId}, Role={Role}, PitchId={PitchId}, Date={Date}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.PitchId, request.Date, request.PageNumber, request.PageSize);

        try
        {
            // Validar query
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("GetAllTimeSlots validación fallida: UserId={UserId}, Errors={Errors}",
                    userId, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Parsear fecha si viene
            DateOnly? date = null;
            if (!string.IsNullOrEmpty(request.Date))
            {
                if (DateOnly.TryParse(request.Date, out var parsedDate))
                {
                    date = parsedDate;
                }
                else
                {
                    return Error.Validation("Date", "La fecha no tiene un formato válido.");
                }
            }

            // Delegar al repositorio
            var result = await timeSlotRepository.GetAllAsync(
                request.PitchId,
                date,
                userId,
                userRole,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                logger.LogWarning(
                    "[SLOW QUERY] GetAllTimeSlots: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PitchId={PitchId}, Date={Date}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PitchId, request.Date, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                logger.LogInformation(
                    "GetAllTimeSlots completado: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(ex, "GetAllTimeSlots error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
