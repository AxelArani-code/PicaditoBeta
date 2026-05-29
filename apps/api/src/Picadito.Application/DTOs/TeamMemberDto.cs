namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar un miembro del equipo en las respuestas de la API.
/// </summary>
public class TeamMemberDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserAvatar { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}

/// <summary>
/// DTO para crear un nuevo miembro en un equipo.
/// </summary>
public class CreateTeamMemberDto
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public string? Role { get; set; }
}

/// <summary>
/// DTO para actualizar el rol de un miembro del equipo.
/// </summary>
public class UpdateTeamMemberDto
{
    public string? Role { get; set; }
}
