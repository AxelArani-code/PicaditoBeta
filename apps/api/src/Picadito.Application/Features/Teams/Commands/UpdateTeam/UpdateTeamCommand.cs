using System;

namespace Picadito.Application.Features.Teams.Commands.UpdateTeam;

/// <summary>
/// Comando para actualizar un equipo (PATCH).
/// </summary>
public class UpdateTeamCommand
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? LogoUrl { get; set; }

    /// <summary>
    /// ID del nuevo capitán. Solo los administradores pueden transferir la capitanía.
    /// </summary>
    public Guid? CaptainId { get; set; }
}
