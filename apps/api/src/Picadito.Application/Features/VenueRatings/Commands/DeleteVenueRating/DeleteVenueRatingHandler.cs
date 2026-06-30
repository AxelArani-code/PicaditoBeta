using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.VenueRatings.Commands.DeleteVenueRating;

/// <summary>
/// Handler para eliminar una calificación.
/// Solo administradores (no hay política RLS para DELETE).
/// </summary>
public class DeleteVenueRatingHandler(
    IVenueRatingRepository venueRatingRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteVenueRatingHandler> logger)
{
    private readonly ILogger<DeleteVenueRatingHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteVenueRatingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, VenueRatingId: {VenueRatingId}", correlationId, request.Id))
        {
            _logger.LogInformation("Deleting venue rating. VenueRatingId: {VenueRatingId}", request.Id);

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            // Solo administradores pueden eliminar calificaciones
            if (!currentUserService.IsAdmin)
            {
                _logger.LogWarning(
                    "Non-admin user attempted to delete rating. UserId: {UserId}",
                    currentUserService.UserId.Value);
                return Error.Forbidden(description: "Solo los administradores pueden eliminar calificaciones.");
            }

            var rating = await venueRatingRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (rating == null)
            {
                _logger.LogWarning("Venue rating not found. VenueRatingId: {VenueRatingId}", request.Id);
                return DomainErrors.VenueRating.NotFound;
            }

            await venueRatingRepository.DeleteAsync(request.Id, cancellationToken);

            _logger.LogInformation(
                "Venue rating deleted successfully. VenueRatingId: {VenueRatingId}",
                rating.Id);

            return Result.Success;
        }
    }
}
