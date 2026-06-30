namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para la entidad Match.
/// Incluye datos desnormalizados del Venue para facilitar el consumo en el frontend.
/// </summary>
public class MatchDto
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
