namespace Picadito.Application.Features.AvailabilityRules.Queries.GetAllAvailabilityRules;

public class GetAllAvailabilityRulesQuery
{
    public Guid? PitchId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
