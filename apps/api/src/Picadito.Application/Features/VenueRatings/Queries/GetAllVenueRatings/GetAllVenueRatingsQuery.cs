using System;

namespace Picadito.Application.Features.VenueRatings.Queries.GetAllVenueRatings;

/// <summary>
/// Query para obtener calificaciones con filtros opcionales y paginación.
/// Acceso público según la política RLS "Ratings viewable by everyone".
/// </summary>
public class GetAllVenueRatingsQuery
{
    /// <summary>
    /// Filtro por ID del complejo deportivo.
    /// </summary>
    public Guid? VenueId { get; set; }

    /// <summary>
    /// Filtro por ID del usuario.
    /// </summary>
    public Guid? UserId { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
