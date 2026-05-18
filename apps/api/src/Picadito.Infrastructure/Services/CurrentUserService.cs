using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Picadito.Application.Common.Interfaces;

namespace Picadito.Infrastructure.Services;

/// <summary>
/// CurrentUserService es una implementación de ICurrentUserService que extrae la 
/// información del usuario actual a partir del contexto HTTP. 
/// Utiliza IHttpContextAccessor para acceder al ClaimsPrincipal del usuario 
/// autenticado y proporciona propiedades para obtener el UserId, Role y si el usuario 
/// es admin. El evento OnTokenValidated en la configuración de JWT en Program.cs se encarga 
/// de mapear el rol personalizado de Supabase a un claim estándar de .NET, lo que permite que 
/// esta clase funcione correctamente con la información de autenticación proporcionada por Supabase.
/// </summary>
/// <param name="httpContextAccessor"></param>
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private readonly ClaimsPrincipal? _user = httpContextAccessor.HttpContext?.User;

    public Guid? UserId => Guid.TryParse(_user?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
    public string? Role => _user?.FindFirst(ClaimTypes.Role)?.Value;
    public bool IsAdmin => Role?.Equals("admin", System.StringComparison.OrdinalIgnoreCase) ?? false;
}
