using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ErrorOr;
using System.Text.Json;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Handler para procesar GetAllPitchesQuery con paginación.
/// Se encarga de validar la solicitud, extraer el contexto de seguridad del JWT
/// y devolver la lista paginada de canchas o errores en caso de fallo.
/// </summary>
public class GetAllPitchesHandler(
    IPitchRepository pitchRepository,
    IValidator<GetAllPitchesQuery> validator,
    IHttpContextAccessor httpContextAccessor,
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

        // Verificar que el usuario este autenticado.
        var user = httpContextAccessor.HttpContext?.User;
        
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        // Extraer el UserId del claim para auditoría y logging.
        var userIdClaim = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        var userId = Guid.Parse(userIdClaim);

        // Extraer rol desde app_metadata (formato JSON)
        var rawRoleClaim = httpContextAccessor.HttpContext?.User.FindFirst("app_metadata")?.Value;
        string? roleName = null;

        if (!string.IsNullOrEmpty(rawRoleClaim))
        {
            try
            {
                using var jsonDoc = JsonDocument.Parse(rawRoleClaim);
                if (jsonDoc.RootElement.TryGetProperty("role", out var roleElement))
                {
                    roleName = roleElement.GetString();
                }
            }
            catch
            {
                _logger.LogWarning("Invalid role format in token");
                return Error.Unauthorized(description: "El formato del rol en el token es inválido.");
            }
        }

        if (!Enum.TryParse<UserRole>(roleName, true, out var userRole))
        {
            _logger.LogWarning("Invalid role. Role: {Role}", roleName);
            return Error.Forbidden(code: "Role.Invalid", description: $"El rol '{roleName}' no es reconocido.");
        }

        _logger.LogInformation("GetAllPitches request started: UserId={UserId}, Role={Role}, VenueId={VenueId}, Type={Type}, Surface={Surface}, PageNumber={PageNumber}, PageSize={PageSize}",
            userIdClaim, userRole, request.VenueId, request.Type, request.Surface, request.PageNumber, request.PageSize);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetAllPitches validation failed: UserId={UserId}, Errors={Errors}",
                    userIdClaim, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
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
                    elapsedMs, userIdClaim, userRole, request.VenueId, request.Type, request.Surface, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllPitches completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userIdClaim, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetAllPitches error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userIdClaim, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
