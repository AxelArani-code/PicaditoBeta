namespace Picadito.Domain.Entities;

public class Profile
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; } = string.Empty;
    public string Role { get; private set; } = "player";
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    
    private Profile() { }

    public Profile(Guid id, string username, string fullName, string avatarUrl, string role)
    {
        Id = id;
        Username = username;
        FullName = fullName;
        AvatarUrl = avatarUrl;
        Role = role;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string? username, string? fullName, string? avatarUrl)
    {
        if (!string.IsNullOrWhiteSpace(username))
            Username = username;
        if (!string.IsNullOrWhiteSpace(fullName))
            FullName = fullName;
        if (!string.IsNullOrWhiteSpace(avatarUrl))
            AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateRole(string role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }
}
