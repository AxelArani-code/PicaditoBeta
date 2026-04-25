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

namespace Picadito.Application.Features.Venues.Commands.CreateVenue;

/// <summary>
/// Handler para el comando de crear un nuevo complejo deportivo.
/// </summary>
public class CreateVenueHandler(
    IVenueRepository venueRepository,
    IValidator<CreateVenueCommand> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CreateVenueHandler> logger)
{
    private readonly ILogger<CreateVenueHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting venue creation for Name: {Name}", request.Name);

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

            // Verificar si ya existe un venue con ese nombre
            var exists = await venueRepository.ExistsByNameAsync(request.Name, cancellationToken);
            if (exists)
            {
                _logger.LogWarning("Venue already exists. Name: {Name}", request.Name);
                return DomainErrors.Venue.AlreadyExists;
            }

            // Crear la entidad
            var venue = new Venue
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Address = request.Address,
                City = request.City,
                Phone = request.Phone,
                Images = request.Images ?? new List<string>(),
                Description = request.Description,
                OwnerId = userId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Persistir
            await venueRepository.AddAsync(venue, cancellationToken);

            _logger.LogInformation(
                "Venue created successfully. VenueId: {VenueId}, Name: {Name}, OwnerId: {OwnerId}",
                venue.Id, venue.Name, venue.OwnerId);

            return venue.Id;
        }
    }
}