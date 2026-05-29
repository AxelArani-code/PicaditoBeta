using System;

namespace Picadito.Application.Features.TeamMembers.Queries.GetAllTeamMembers;

/// <summary>
/// Query para obtener todos los miembros de equipo con filtros y paginación.
/// </summary>
public class GetAllTeamMembersQuery
{
    /// <summary>
    /// Filtro por ID del equipo.
    /// </summary>
    public Guid? TeamId { get; set; }

    /// <summary>
    /// Filtro por ID del usuario.
    /// </summary>
    public Guid? UserId { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
