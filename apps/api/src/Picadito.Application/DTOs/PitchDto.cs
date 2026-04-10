using System;

namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar una cancha en las respuestas de la API.
/// </summary>
public class PitchDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Surface { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
    public bool IsActive { get; set; }
}
