using System;

namespace Picadito.Application.Features.Venues.Queries.GetVenueById;

/// <summary>
/// Query para obtener un complejo deportivo por su ID.
/// </summary>
public class GetVenueByIdQuery
{
    public Guid Id { get; set; }
}