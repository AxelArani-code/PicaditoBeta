using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence;

namespace Picadito.Infrastructure.Services;
/// <summary>
/// CurrentUserService es una implementación de ICurrentUserService que extrae la 
/// información del usuario actual a partir del contexto HTTP. 
/// Utiliza IHttpContextAccessor para acceder al ClaimsPrincipal del usuario 
/// autenticado y proporciona propiedades para obtener el UserId, Role y si el usuario 
/// es admin.
/// </summary>
/// <param name="httpContextAccessor"></param>
public class CurrentUserService : ICurrentUserService
{
    private readonly ClaimsPrincipal? _user;
    private readonly ApplicationDbContext _dbContext;
    private string? _cachedRole;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor, 
        ApplicationDbContext dbContext)
    {
        _user = httpContextAccessor.HttpContext?.User;
        _dbContext = dbContext;
        Console.WriteLine($"UserId: {UserId}");
    }

    public Guid? UserId =>
        Guid.TryParse(_user?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    public string? Role
    {
        get
        {
            if (_cachedRole is null && UserId.HasValue)
            {
                _cachedRole = _dbContext.Profiles
                    .AsNoTracking()
                    .Where(p => p.Id == UserId.Value)
                    .Select(p => p.Role)
                    .FirstOrDefault();
            }
            return _cachedRole;
        }
    }

    public UserRole? UserRole =>
        Enum.TryParse<Domain.Enums.UserRole>(Role, true, out var role) ? role : null;

    public bool IsAdmin => UserRole is Domain.Enums.UserRole.admin;
}
