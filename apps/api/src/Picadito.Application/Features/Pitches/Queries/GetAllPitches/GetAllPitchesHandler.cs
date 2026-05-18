using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Handler para procesar GetAllPitchesQuery con paginación.
/// </summary>
public class GetAllPitchesHandler(
    IPitchRepository pitchRepository,
    IValidator<GetAllPitchesQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllPitchesHandler> logger)
{
    private readonly ILogger<GetAllPitchesHandler> _logger = logger;

    /// <summary>
    /// Procesa la solicitud de listar todas las canchas con paginación.
    /// </summary>
    /// <param name="request">Query con los parámetros de filtrado y paginación.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada de DTOs de canchas o errores.</returns>
    public async Task<ErrorOr<PagedResponse<PitchDto>>> Handle(GetAllPitchesQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        if (currentUserService.UserId is null)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userId = currentUserService.UserId.Value;

        if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
        {
            _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
            return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
        }

        _logger.LogInformation("GetAllPitches request started: UserId={UserId}, Role={Role}, VenueId={VenueId}, Type={Type}, Surface={Surface}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.VenueId, request.Type, request.Surface, request.PageNumber, request.PageSize);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetAllPitches validation failed: UserId={UserId}, Errors={Errors}",
                    userId, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error => 
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Calcular el valor de skip basado en la fórmula: (PageNumber - 1) * PageSize
            var skip = (request.PageNumber - 1) * request.PageSize;
            _logger.LogDebug("Calculated skip value: {Skip} for PageNumber: {PageNumber}, PageSize: {PageSize}",
                skip, request.PageNumber, request.PageSize);

            // Obtener las canchas desde el repositorio con filtros, paginación y seguridad por rol
            var result = await pitchRepository.GetAllAsync(
                request.VenueId,
                request.Type,
                request.Surface,
                userId,
                userRole,
                request.PageNumber,
                request.PageSize,
                cancellationToken
                );

            if (result.IsError)
            {
                return result.Errors;
            }

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllPitches: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, VenueId={VenueId}, Type={Type}, Surface={Surface}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.VenueId, request.Type, request.Surface, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllPitches completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetAllPitches error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
