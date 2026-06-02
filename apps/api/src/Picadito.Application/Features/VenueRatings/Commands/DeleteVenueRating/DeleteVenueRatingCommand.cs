using System;

namespace Picadito.Application.Features.VenueRatings.Commands.DeleteVenueRating;

/// <summary>
/// Comando para eliminar una calificación.
/// Solo administradores.
/// </summary>
public class DeleteVenueRatingCommand
{
    public Guid Id { get; set; }
}
