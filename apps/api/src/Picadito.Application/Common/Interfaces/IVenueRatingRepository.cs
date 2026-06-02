using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de calificaciones de complejos deportivos.
/// </summary>
public interface IVenueRatingRepository
{
    /// <summary>
    /// Crea una nueva calificación.
    /// </summary>
    Task<ErrorOr<Guid>> AddAsync(VenueRating rating, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene todas las calificaciones con filtros opcionales y paginación.
    /// </summary>
    Task<ErrorOr<PagedResponse<VenueRatingDto>>> GetAllAsync(
        Guid? venueId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene una calificación por su ID.
    /// </summary>
    Task<VenueRatingDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene la entidad VenueRating por su ID.
    /// </summary>
    Task<VenueRating?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si el usuario ya calificó un partido específico.
    /// </summary>
    Task<bool> HasRatedMatchAsync(Guid userId, Guid matchId, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si el usuario es participante de un partido.
    /// </summary>
    Task<bool> IsMatchParticipantAsync(Guid userId, Guid matchId, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene el promedio de calificaciones de un complejo deportivo.
    /// </summary>
    Task<(double? Average, int Count)> GetVenueStatsAsync(Guid venueId, CancellationToken cancellationToken);

    /// <summary>
    /// Elimina una calificación.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
