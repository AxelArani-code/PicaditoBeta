using System.Collections.Generic;

namespace Picadito.Domain.Entities;

/// <summary>
/// Entidad que representa un equipo deportivo.
/// Mapea a la tabla 'teams' de la base de datos.
/// </summary>
public class Team
{
    public Guid Id { get; set; }

    // Relación con el perfil del capitán (campo denormalizado para consultas rápidas).
    // La fuente de verdad para autorización es team_members con role = 'captain'.
    public Guid CaptainId { get; set; }

    public string Name { get; set; } = string.Empty;

    // Slug único para URLs (se genera automáticamente en la BD)
    public string Slug { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }

    // Navigation Property: el perfil del capitán del equipo
    public virtual Profile Captain { get; set; } = null!;

    // Navigation Property: colección de miembros del equipo
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
