namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar un equipo en las respuestas de la API.
/// </summary>
public class TeamDto
{
    public Guid Id { get; set; }
    public Guid CaptainId { get; set; }
    public string? CaptainName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO para crear un nuevo equipo.
/// </summary>
public class CreateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}

/// <summary>
/// DTO para actualizar un equipo.
/// </summary>
public class UpdateTeamDto
{
    public string? Name { get; set; }
    public string? LogoUrl { get; set; }
}
