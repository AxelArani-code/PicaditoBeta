using System;

namespace Picadito.Application.Features.Teams.Commands.DeleteTeam;

/// <summary>
/// Comando para eliminar un equipo (Soft Delete).
/// </summary>
public class DeleteTeamCommand
{
    public Guid Id { get; set; }
}
