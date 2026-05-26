using Picadito.Domain.Enums;

namespace Picadito.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Role { get; }
    UserRole? UserRole { get; }
    bool IsAdmin { get; }
}
