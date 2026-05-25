using System;

namespace Picadito.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileCommand
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Role { get; set; }
}
