using System;

namespace Picadito.Domain.Entities;

/// <summary>
/// Entidad que representa la relación entre un equipo y sus miembros.
/// Mapea a la tabla 'team_members' de la base de datos.
/// </summary>
public class TeamMember
{
    public Guid Id { get; set; }

    /// <summary>
    /// FK hacia el equipo al que pertenece el miembro.
    /// </summary>
    public Guid TeamId { get; set; }

    /// <summary>
    /// FK hacia el perfil del usuario miembro.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Rol dentro del equipo: 'captain' o 'player'.
    /// </summary>
    public string Role { get; set; } = "player";

    /// <summary>
    /// Fecha en que el usuario se unió al equipo.
    /// </summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Team Team { get; set; } = null!;
    public virtual Profile User { get; set; } = null!;
}
