using System;

namespace Picadito.Application.Features.TeamMembers.Commands.UpdateTeamMember;

/// <summary>
/// Comando para actualizar el rol de un miembro del equipo.
/// </summary>
public class UpdateTeamMemberCommand
{
    public Guid Id { get; set; }

    /// <summary>
    /// Nuevo rol del miembro: 'captain' o 'player'.
    /// </summary>
    public string? Role { get; set; }
}
