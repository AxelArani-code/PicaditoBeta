using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Matches.Queries.GetAllMatches;

/// <summary>
/// Manejador para la consulta paginada de Matches.
/// Aplica filtros por complejo, fecha y estado, y seguridad basada en roles.
/// </summary>
public class GetAllMatchesHandler(
    IMatchRepository matchRepository,
    IValidator<GetAllMatchesQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllMatchesHandler> logger)
{
    public async Task<ErrorOr<PagedResponse<MatchDto>>> Handle(
        GetAllMatchesQuery request, CancellationToken cancellationToken)
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
            "GetAllMatches request iniciado: UserId={UserId}, Role={Role}, VenueId={VenueId}, Date={Date}, Status={Status}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.VenueId, request.Date, request.Status, request.PageNumber, request.PageSize);

        try
        {
            // Validar query
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("GetAllMatches validación fallida: UserId={UserId}, Errors={Errors}",
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
            var result = await matchRepository.GetAllAsync(
                request.VenueId,
                date,
                request.Status,
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
                    "[SLOW QUERY] GetAllMatches: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, VenueId={VenueId}, Date={Date}, Status={Status}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.VenueId, request.Date, request.Status, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                logger.LogInformation(
                    "GetAllMatches completado: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            logger.LogError(ex, "GetAllMatches error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
