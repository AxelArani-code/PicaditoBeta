using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Queries.GetVenueById;

/// <summary>
/// Handler para obtener un complejo deportivo por su ID.
/// Acceso público (sin autenticación).
/// </summary>
public class GetVenueByIdHandler(
    IVenueRepository venueRepository,
    ILogger<GetVenueByIdHandler> logger)
{
    private readonly ILogger<GetVenueByIdHandler> _logger = logger;

    public async Task<ErrorOr<VenueDto>> Handle(GetVenueByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetVenueById requested: VenueId={VenueId}", request.Id);

        // Consulta sin autenticación (acceso público)
        var venue = await venueRepository.GetByIdAsync(request.Id, cancellationToken);

        if (venue == null)
        {
            _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.Id);
            return DomainErrors.Venue.NotFound;
        }

        _logger.LogInformation(
            "GetVenueById completed: VenueId={VenueId}, Name={Name}",
            venue.Id, venue.Name);

        return venue;
    }
}