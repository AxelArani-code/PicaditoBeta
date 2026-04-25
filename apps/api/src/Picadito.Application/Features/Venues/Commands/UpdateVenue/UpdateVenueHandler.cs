using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Commands.UpdateVenue;

/// <summary>
/// Handler para el comando de actualizar un complejo deportivo.
/// </summary>
public class UpdateVenueHandler(
    IVenueRepository venueRepository,
    IValidator<UpdateVenueCommand> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<UpdateVenueHandler> logger)
{
    private readonly ILogger<UpdateVenueHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, VenueId: {VenueId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting venue update for VenueId: {VenueId}", request.Id);

            // Validación usando FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

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

            // Verificar que el usuario tenga rol venue_owner
            if (userRole != UserRole.venue_owner)
            {
                _logger.LogWarning("User role not authorized. UserId: {UserId}, Role: {Role}", userId, userRole);
                return Error.Forbidden(description: "Solo los propietarios de complejos pueden crear venues.");
            }

            // Verificar que el venue existe
            var venue = await venueRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (venue == null)
            {
                _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.Id);
                return DomainErrors.Venue.NotFound;
            }

            // Verificar propiedad: solo el owner puede modificar
            if (venue.OwnerId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized update attempt. UserId: {UserId}, VenueOwnerId: {VenueOwnerId}, VenueId: {VenueId}",
                    userId, venue.OwnerId, request.Id);
                return DomainErrors.Venue.Forbidden;
            }

            // Actualizar campos
            if (!string.IsNullOrEmpty(request.Name))
            {
                venue.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.Address))
            {
                venue.Address = request.Address;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                venue.Description = request.Description;
            }

            if (!string.IsNullOrEmpty(request.City))
            {
                venue.City = request.City;
            }

            if (request.Phone != null)
            {
                venue.Phone = request.Phone;
            }

            if (request.Images != null)
            {
                venue.Images = request.Images;
            }

            if (request.IsActive.HasValue)
            {
                venue.IsActive = request.IsActive.Value;
            }

            // Persistir
            await venueRepository.UpdateAsync(venue, cancellationToken);

            _logger.LogInformation(
                "Venue updated successfully. VenueId: {VenueId}, Name: {Name}",
                venue.Id, venue.Name);

            return Result.Success;
        }
    }
}