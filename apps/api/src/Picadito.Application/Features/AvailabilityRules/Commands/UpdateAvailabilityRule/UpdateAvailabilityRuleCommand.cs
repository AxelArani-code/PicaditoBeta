namespace Picadito.Application.Features.AvailabilityRules.Commands.UpdateAvailabilityRule;

public class UpdateAvailabilityRuleCommand
{
    public Guid Id { get; set; }
    public string? DayOfWeek { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
    public decimal? PriceOverride { get; set; }
}
