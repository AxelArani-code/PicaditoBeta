using System;

namespace Picadito.Application.Features.VenueRatings.Queries.GetVenueRatingById;

/// <summary>
/// Query para obtener una calificación por su ID.
/// Acceso público.
/// </summary>
public class GetVenueRatingByIdQuery
{
    public Guid Id { get; set; }
}
