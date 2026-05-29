using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de equipos deportivos.
/// </summary>
public interface ITeamRepository
{
    /// <summary>
    /// Crea un nuevo equipo en la base de datos.
    /// </summary>
    Task<ErrorOr<Guid>> AddAsync(Team team, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene todos los equipos públicos con paginación y filtro opcional por nombre.
    /// </summary>
    Task<ErrorOr<PagedResponse<TeamDto>>> GetAllAsync(
        string? name,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un equipo por su ID (público).
    /// </summary>
    Task<TeamDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene la entidad Team por su ID (para operaciones de escritura).
    /// </summary>
    Task<Team?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si existe un equipo con el nombre especificado.
    /// </summary>
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si el usuario es el capitán del equipo mediante captain_id.
    /// </summary>
    Task<bool> IsCaptainAsync(Guid teamId, Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Actualiza un equipo existente.
    /// </summary>
    Task<ErrorOr<Success>> UpdateAsync(Team team, CancellationToken cancellationToken);

    /// <summary>
    /// Realiza un soft delete del equipo.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
