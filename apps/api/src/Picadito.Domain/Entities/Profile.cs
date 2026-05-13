namespace Picadito.Domain.Entities;

/// <summary>
/// Representa el perfil de un usuario en el sistema.
/// Cada perfil está asociado a un usuario de autenticación (auth.users).
/// </summary>
public class Profile
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string AvatarUrl { get; private set; } = string.Empty;
    public string Role { get; private set; } = "player";
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    
    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private Profile() { }
}
