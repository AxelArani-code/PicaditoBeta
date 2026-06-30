using System;

namespace Picadito.Application.Features.Teams.Commands.CreateTeam;

/// <summary>
/// Comando para crear un nuevo equipo deportivo.
/// </summary>
public class CreateTeamCommand
{
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }

    /// <summary>
    /// ID del capitán. Opcional - si no se proporciona,
    /// se asignará automáticamente el ID del usuario autenticado.
    /// Solo los administradores pueden asignar un capitán diferente.
    /// </summary>
    public Guid? CaptainId { get; set; }
}
