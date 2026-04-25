using System;

namespace Picadito.Application.Features.Venues.Queries.GetAllVenues;

/// <summary>
/// Query para obtener todos los complejos deportivos con filtros.
/// </summary>
public class GetAllVenuesQuery
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public bool? IsActive { get; set; }
}