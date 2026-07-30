namespace Picadito.Application.Features.VenueClosures.Commands.CreateVenueClosure;

public class CreateVenueClosureCommand
{
    public Guid? PitchId { get; set; }
    public string ClosureDate { get; set; } = string.Empty;
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Reason { get; set; }
}
