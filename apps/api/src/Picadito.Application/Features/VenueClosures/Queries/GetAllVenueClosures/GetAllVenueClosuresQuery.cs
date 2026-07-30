namespace Picadito.Application.Features.VenueClosures.Queries.GetAllVenueClosures;

public class GetAllVenueClosuresQuery
{
    public Guid? PitchId { get; set; }
    public string? FromDate { get; set; }
    public string? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
