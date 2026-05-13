using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ErrorOr;
using System.Text.Json;
using System.Diagnostics;

namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Handler para procesar GetAllPitchesQuery.
/// Se encarga de validar la solicitud, extraer el contexto de seguridad del JWT
/// y devolver la lista de canchas o errores en caso de fallo.
/// </summary>
public class GetAllPitchesHandler(
    IPitchRepository pitchRepository,
    IValidator<GetAllPitchesQuery> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetAllPitchesHandler> logger)
{
    private readonly ILogger<GetAllPitchesHandler> _logger = logger;

    /// <summary>
    /// Procesa la solicitud de listar todas las canchas.
    /// </summary>
    /// <param name="request">Query con los parámetros de filtrado.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Lista de DTOs de canchas o errores.</returns>
    public async Task<ErrorOr<List<PitchDto>>> Handle(GetAllPitchesQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        var user = httpContextAccessor.HttpContext?.User;
        
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userIdClaim = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        _logger.LogInformation("GetAllPitches request started: UserId={UserId}, VenueId={VenueId}, Type={Type}, Surface={Surface}",
            userIdClaim, request.VenueId, request.Type, request.Surface);

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
                }
            }

            var pitches = await pitchRepository.GetAllAsync(
                request.VenueId, 
                request.Type, 
                request.Surface, 
                cancellationToken
                );

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllPitches: ElapsedMs={ElapsedMs}, UserId={UserId}, VenueId={VenueId}, Type={Type}, Surface={Surface}, Count={Count}",
                    elapsedMs, userIdClaim, request.VenueId, request.Type, request.Surface, pitches.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllPitches completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Count={Count}",
                    elapsedMs, userIdClaim, pitches.Count);
            }

            return pitches;
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
