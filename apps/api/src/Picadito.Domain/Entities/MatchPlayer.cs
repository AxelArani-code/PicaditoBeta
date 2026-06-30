namespace Picadito.Domain.Entities;

/// <summary>
/// Representa la participación de un jugador en un partido.
/// Puede ser un usuario registrado (UserId) o un invitado (GuestName).
/// </summary>
public class MatchPlayer
{
    public Guid Id { get; private set; }
    public Guid MatchId { get; private set; }
    public Guid? TeamId { get; private set; }
    public Guid? UserId { get; private set; }
    public string? GuestName { get; private set; }
    public string? TeamSide { get; private set; }
    public bool IsMvp { get; private set; }
    public int Goals { get; private set; }
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Relación de navegación: el jugador pertenece a un partido.
    /// </summary>
    public virtual Match Match { get; private set; } = null!;

    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private MatchPlayer() { }

    /// <summary>
    /// Constructor para crear un nuevo MatchPlayer.
    /// </summary>
    public MatchPlayer(Guid matchId, Guid? userId, string? guestName, string? teamSide)
    {
        Id = Guid.NewGuid();
        MatchId = matchId;
        UserId = userId;
        GuestName = guestName;
        TeamSide = teamSide;
        IsMvp = false;
        Goals = 0;
        CreatedAt = DateTime.UtcNow;
    }
}
