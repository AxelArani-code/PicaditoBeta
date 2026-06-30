using System;

namespace Picadito.Application.Features.VenueRatings.Commands.CreateVenueRating;

/// <summary>
/// Comando para crear una calificación de un complejo deportivo.
/// </summary>
public class CreateVenueRatingCommand
{
    public Guid VenueId { get; set; }

    /// <summary>
    /// ID del partido asociado (opcional). Si se proporciona,
    /// se valida que el usuario sea participante del partido.
    /// </summary>
    public Guid? MatchId { get; set; }

    /// <summary>
    /// Puntuación del 1 al 5.
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// Comentario opcional.
    /// </summary>
    public string? Comment { get; set; }
}
