using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.VenueRatings.Queries.GetVenueRatingById;

/// <summary>
/// Handler para obtener una calificación por su ID.
/// Acceso público.
/// </summary>
public class GetVenueRatingByIdHandler(
    IVenueRatingRepository venueRatingRepository,
    ILogger<GetVenueRatingByIdHandler> logger)
{
    private readonly ILogger<GetVenueRatingByIdHandler> _logger = logger;

    public async Task<ErrorOr<VenueRatingDto>> Handle(GetVenueRatingByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetVenueRatingById requested: VenueRatingId={VenueRatingId}", request.Id);

        var rating = await venueRatingRepository.GetByIdAsync(request.Id, cancellationToken);

        if (rating == null)
        {
            _logger.LogWarning("Venue rating not found. VenueRatingId: {VenueRatingId}", request.Id);
            return DomainErrors.VenueRating.NotFound;
        }

        _logger.LogInformation(
            "GetVenueRatingById completed: VenueRatingId={VenueRatingId}, VenueId={VenueId}, Rating={Rating}",
            rating.Id, rating.VenueId, rating.Rating);

        return rating;
    }
}
