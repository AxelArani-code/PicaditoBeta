using System;

namespace Picadito.Application.Features.Pitches.Commands.UpdatePitch;

public class UpdatePitchCommand
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Surface { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
    public bool IsActive { get; set; }
}
