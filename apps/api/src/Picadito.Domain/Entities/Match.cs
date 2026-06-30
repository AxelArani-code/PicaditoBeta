using Picadito.Domain.Enums;

namespace Picadito.Domain.Entities;

/// <summary>
/// Representa un partido generado a partir de una reserva confirmada.
/// Un Match pertenece a un Booking, un Venue, y tiene jugadores asociados (MatchPlayers).
/// </summary>
public class Match
{
    public Guid Id { get; private set; }
    public Guid BookingId { get; private set; }
    public Guid VenueId { get; private set; }
    public DateOnly Date { get; private set; }
    public MatchStatus Status { get; private set; }
    public int HomeScore { get; private set; }
    public int AwayScore { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    /// <summary>
    /// Relación de navegación: el partido pertenece a una reserva.
    /// </summary>
    public virtual Booking Booking { get; private set; } = null!;

    /// <summary>
    /// Relación de navegación: el partido se juega en un complejo deportivo.
    /// </summary>
    public virtual Venue Venue { get; private set; } = null!;

    /// <summary>
    /// Relación de navegación: jugadores participantes en el partido.
    /// </summary>
    public virtual ICollection<MatchPlayer> MatchPlayers { get; private set; } = new List<MatchPlayer>();

    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private Match() { }

    /// <summary>
    /// Constructor para crear un nuevo partido.
    /// </summary>
    public Match(Guid bookingId, Guid venueId, DateOnly date)
    {
        Id = Guid.NewGuid();
        BookingId = bookingId;
        VenueId = venueId;
        Date = date;
        Status = MatchStatus.scheduled;
        HomeScore = 0;
        AwayScore = 0;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Actualiza el resultado del partido (solo si está programado).
    /// </summary>
    public void SetScore(int homeScore, int awayScore)
    {
        HomeScore = homeScore;
        AwayScore = awayScore;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Marca el partido como jugado.
    /// </summary>
    public void MarkAsPlayed()
    {
        Status = MatchStatus.played;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Cancela el partido.
    /// </summary>
    public void Cancel()
    {
        Status = MatchStatus.cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}
