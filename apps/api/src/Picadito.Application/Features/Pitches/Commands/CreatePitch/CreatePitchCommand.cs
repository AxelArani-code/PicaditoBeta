using System;

namespace Picadito.Application.Features.Pitches.Commands.CreatePitch;

public class CreatePitchCommand
{
    public string Name { get; set; } = string.Empty;
    public Guid VenueId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Surface { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
}
