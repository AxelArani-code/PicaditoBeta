using System;

namespace Picadito.Application.Features.Venues.Commands.CreateVenue;

/// <summary>
/// Comando para crear un nuevo complejo deportivo.
/// </summary>
public class CreateVenueCommand
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    public List<string>? Images { get; set; } = new();
    public string? Description { get; set; }
}