using System;

namespace Picadito.Domain.Entities;

/// <summary>
/// Entidad que representa la calificación de un usuario a un complejo deportivo.
/// Mapea a la tabla 'venue_ratings' de la base de datos.
/// </summary>
public class VenueRating
{
    public Guid Id { get; set; }

    /// <summary>
    /// FK hacia el complejo deportivo calificado.
    /// </summary>
    public Guid VenueId { get; set; }

    /// <summary>
    /// FK hacia el usuario que realizó la calificación.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// FK opcional hacia el partido asociado a la calificación.
    /// </summary>
    public Guid? MatchId { get; set; }

    /// <summary>
    /// Puntuación del 1 al 5.
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// Comentario opcional del usuario.
    /// </summary>
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Venue Venue { get; set; } = null!;
    public virtual Profile User { get; set; } = null!;
    public virtual Match? Match { get; set; }
}
