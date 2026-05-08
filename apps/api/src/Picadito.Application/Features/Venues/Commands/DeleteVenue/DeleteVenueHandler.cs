using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Picadito.Domain.Enums;
namespace Picadito.Application.Features.Venues.Commands.DeleteVenue;

/// <summary>
/// Handler para el comando de eliminar un complejo deportivo (Soft Delete).
/// </summary>
public class DeleteVenueHandler(
    IVenueRepository venueRepository,
    IHttpContextAccessor httpContextAccessor,
    ILogger<DeleteVenueHandler> logger)
{
    private readonly ILogger<DeleteVenueHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, VenueId: {VenueId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting venue soft delete for VenueId: {VenueId}", request.Id);

            // Extraer usuario del JWT
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _logger.LogWarning("User not authenticated");
                return Error.Unauthorized(description: "Usuario no autenticado");
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

            // Verificar que el venue existe
            var venue = await venueRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (venue == null)
            {
                _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.Id);
                return DomainErrors.Venue.NotFound;
            }

            // Verificar propiedad: solo el owner puede eliminar
            if (venue.OwnerId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized delete attempt. UserId: {UserId}, VenueOwnerId: {VenueOwnerId}, VenueId: {VenueId}",
                    userId, venue.OwnerId, request.Id);
                return DomainErrors.Venue.Forbidden;
            }

            // Soft delete
            await venueRepository.DeleteAsync(request.Id, cancellationToken);

            _logger.LogInformation(
                "Venue soft deleted successfully. VenueId: {VenueId}, Name: {Name}",
                venue.Id, venue.Name);

            return Result.Success;
        }
    }
}