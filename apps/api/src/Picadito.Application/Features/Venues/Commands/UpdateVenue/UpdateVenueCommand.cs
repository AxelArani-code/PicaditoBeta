using System;

namespace Picadito.Application.Features.Venues.Commands.UpdateVenue;

/// <summary>
/// Comando para actualizar un complejo deportivo (PATCH).
/// </summary>
public class UpdateVenueCommand
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public List<string>? Images { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}