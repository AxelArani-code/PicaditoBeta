using System;

namespace Picadito.Application.Features.TeamMembers.Queries.GetTeamMemberById;

/// <summary>
/// Query para obtener un miembro del equipo por su ID.
/// </summary>
public class GetTeamMemberByIdQuery
{
    public Guid Id { get; set; }
}
