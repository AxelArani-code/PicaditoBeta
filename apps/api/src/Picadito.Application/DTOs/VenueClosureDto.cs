namespace Picadito.Application.DTOs;

public class VenueClosureDto
{
    public Guid Id { get; set; }
    public Guid? PitchId { get; set; }
    public string PitchName { get; set; } = string.Empty;
    public string VenueName { get; set; } = string.Empty;
    public string ClosureDate { get; set; } = string.Empty;
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}
