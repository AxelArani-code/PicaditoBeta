using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Venues.Commands.DeleteVenue;

/// <summary>
/// Handler para el comando de eliminar un complejo deportivo (Soft Delete).
/// </summary>
public class DeleteVenueHandler(
    IVenueRepository venueRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteVenueHandler> logger)
{
    private readonly ILogger<DeleteVenueHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, VenueId: {VenueId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting venue soft delete for VenueId: {VenueId}", request.Id);

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
            {
                _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;
            var isOwner = userRole == UserRole.venue_owner;

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