namespace Picadito.Application.Features.AvailabilityRules.Commands.CreateAvailabilityRule;

public class CreateAvailabilityRuleCommand
{
    public Guid PitchId { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
}
