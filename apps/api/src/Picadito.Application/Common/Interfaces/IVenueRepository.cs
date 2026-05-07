using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de complejos deportivos.
/// </summary>
public interface IVenueRepository
{
    /// <summary>
    /// Crea un nuevo complejo deportivo.
    /// </summary>
    /// <param name="venue">Entidad del complejo a crear.</param>
    /// <param name="currentUserId">ID del usuario autenticado que realiza la operación.</param>
    /// <param name="isAdmin">Indica si el usuario tiene rol de administrador.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>El ID del complejo creado o un error.</returns>
    Task<ErrorOr<Guid>> AddAsync(Venue venue, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene todos los complejos deportivos con filtros opcionales.
    /// </summary>
    Task<List<VenueDto>> GetAllAsync(
        string? name,
        string? address,
        bool? isActive,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un complejo deportivo por su ID.
    /// </summary>
    Task<VenueDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un complejo deportivo por su ID (para validación de propiedad).
    /// </summary>
    Task<Venue?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si existe un complejo deportivo con el nombre especificado.
    /// </summary>
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si el usuario es el propietario del complejo.
    /// </summary>
    Task<bool> IsOwnerAsync(Guid venueId, Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Actualiza un complejo deportivo.
    /// </summary>
    /// <param name="venue">Entidad del complejo a actualizar.</param>
    /// <param name="currentUserId">ID del usuario autenticado que realiza la operación.</param>
    /// <param name="isAdmin">Indica si el usuario tiene rol de administrador.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Resultado de la operación (éxito o error).</returns>
    Task<ErrorOr<Success>> UpdateAsync(Venue venue, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    /// <summary>
    /// Realiza un soft delete del complejo deportivo.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}