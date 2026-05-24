namespace Picadito.Application.DTOs;

public class AvailabilityRuleDto
{
    public Guid Id { get; set; }
    public Guid PitchId { get; set; }
    public string PitchName { get; set; } = string.Empty;
    public string VenueName { get; set; } = string.Empty;
    public string DayOfWeek { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    public DateTime CreatedAt { get; set; }
}
