using System;

namespace Picadito.Application.Features.TeamMembers.Commands.DeleteTeamMember;

/// <summary>
/// Comando para eliminar un miembro del equipo.
/// </summary>
public class DeleteTeamMemberCommand
{
    public Guid Id { get; set; }
}
