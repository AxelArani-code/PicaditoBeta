using System;

namespace Picadito.Application.Features.Teams.Queries.GetTeamById;

/// <summary>
/// Query para obtener un equipo por su ID.
/// </summary>
public class GetTeamByIdQuery
{
    public Guid Id { get; set; }
}
