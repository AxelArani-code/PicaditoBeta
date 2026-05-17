using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IPitchRepository
{
    /// <summary>
    /// Crea una nueva cancha.
    /// </summary>
    Task<ErrorOr<Guid>> AddAsync(Pitch pitch, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);
    
    /// <summary>
    /// Obtiene todas las canchas con filtros opcionales y paginación.
    /// Aplica seguridad por roles: los usuarios ven canchas activas, los dueños ven todas las de sus locales.
    /// </summary>
    /// <param name="venueId">Filtro por ID del complejo.</param>
    /// <param name="type">Filtro por tipo de cancha.</param>
    /// <param name="surface">Filtro por tipo de superficie.</param>
    /// <param name="currentUserId">ID del usuario autenticado para aplicar filtros de seguridad.</param>
    /// <param name="userRole">Rol del usuario para aplicar lógica de seguridad.</param>
    /// <param name="pageNumber">Número de página a obtener (comienza en 1).</param>
    /// <param name="pageSize">Cantidad de elementos por página.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con las canchas y metadata de paginación.</returns>
    Task<ErrorOr<PagedResponse<PitchDto>>> GetAllAsync(
        Guid? venueId,
        string? type,
        string? surface,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);
}
