using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de miembros de equipo.
/// </summary>
public interface ITeamMemberRepository
{
    /// <summary>
    /// Agrega un miembro al equipo.
    /// </summary>
    Task<ErrorOr<Guid>> AddAsync(TeamMember member, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene todos los miembros de un equipo con paginación.
    /// </summary>
    Task<ErrorOr<PagedResponse<TeamMemberDto>>> GetAllAsync(
        Guid? teamId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un miembro por su ID.
    /// </summary>
    Task<TeamMemberDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene la entidad TeamMember por su ID.
    /// </summary>
    Task<TeamMember?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si un usuario ya es miembro de un equipo.
    /// </summary>
    Task<bool> IsMemberAsync(Guid teamId, Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Actualiza un miembro del equipo.
    /// </summary>
    Task<ErrorOr<Success>> UpdateAsync(TeamMember member, CancellationToken cancellationToken);

    /// <summary>
    /// Elimina un miembro del equipo.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
