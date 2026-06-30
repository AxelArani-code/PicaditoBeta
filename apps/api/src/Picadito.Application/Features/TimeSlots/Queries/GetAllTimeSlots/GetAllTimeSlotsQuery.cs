namespace Picadito.Application.Features.TimeSlots.Queries.GetAllTimeSlots;

/// <summary>
/// Query para obtener turnos paginados con filtros opcionales.
/// </summary>
public class GetAllTimeSlotsQuery
{
    public Guid? PitchId { get; set; }
    public string? Date { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
