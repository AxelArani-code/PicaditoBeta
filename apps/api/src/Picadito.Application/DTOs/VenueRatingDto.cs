namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar una calificación de un complejo deportivo.
/// </summary>
public class VenueRatingDto
{
    public Guid Id { get; set; }
    public Guid VenueId { get; set; }
    public string? VenueName { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserAvatar { get; set; }
    public Guid? MatchId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO para crear una calificación.
/// </summary>
public class CreateVenueRatingDto
{
    public Guid VenueId { get; set; }
    public Guid? MatchId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
