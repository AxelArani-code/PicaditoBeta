namespace Picadito.Application.Features.Matches.Queries.GetAllMatches;

/// <summary>
/// Query para obtener partidos paginados con filtros opcionales.
/// </summary>
public class GetAllMatchesQuery
{
    public Guid? VenueId { get; set; }
    public string? Date { get; set; }
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
