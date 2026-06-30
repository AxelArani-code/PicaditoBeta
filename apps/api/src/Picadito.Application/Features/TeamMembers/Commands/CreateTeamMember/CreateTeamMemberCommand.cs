using System;

namespace Picadito.Application.Features.TeamMembers.Commands.CreateTeamMember;

/// <summary>
/// Comando para agregar un miembro a un equipo.
/// </summary>
public class CreateTeamMemberCommand
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }

    /// <summary>
    /// Rol dentro del equipo: 'captain' o 'player'.
    /// Solo los administradores pueden asignar 'captain' directamente.
    /// </summary>
    public string? Role { get; set; }
}
