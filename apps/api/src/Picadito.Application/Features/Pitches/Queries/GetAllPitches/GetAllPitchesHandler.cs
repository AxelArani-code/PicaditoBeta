using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using ErrorOr;
using System.Text.Json;

namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Handler para procesar GetAllPitchesQuery.
/// Se encarga de validar la solicitud, extraer el contexto de seguridad del JWT
/// y devolver la lista de canchas o errores en caso de fallo.
/// </summary>
public class GetAllPitchesHandler(
    IPitchRepository pitchRepository,
    IValidator<GetAllPitchesQuery> validator,
    IHttpContextAccessor httpContextAccessor)
{
    /// <summary>
    /// Procesa la solicitud de listar todas las canchas.
    /// </summary>
    /// <param name="request">Query con los parámetros de filtrado.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Lista de DTOs de canchas o errores.</returns>
    public async Task<ErrorOr<List<PitchDto>>> Handle(GetAllPitchesQuery request, CancellationToken cancellationToken)
    {
        // Logica de validación usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.Errors.ConvertAll(error => 
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Logica de JWT: Verificación de contexto de seguridad
        var user = httpContextAccessor.HttpContext?.User;
        
        // Verificamos que el usuario esté autenticado
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        // Extracción del userId del JWT para auditoria o lógica de negocio
        var userIdClaim = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        // Extracción del rol del usuario desde app_metadata (Supabase)
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
                // Si falla el parsing, continuamos sin rol (se permite acceso público si está autenticado)
            }
        }

        // Logica de negocio: Obtener todas las canchas activas
        // Se agregan parametros de filtrado opcionales.
        var pitches = await pitchRepository.GetAllAsync(
            request.VenueId, 
            request.Type, 
            request.Surface, 
            cancellationToken
            );

        // Retornamos la lista de canchas
        return pitches;
    }
}
