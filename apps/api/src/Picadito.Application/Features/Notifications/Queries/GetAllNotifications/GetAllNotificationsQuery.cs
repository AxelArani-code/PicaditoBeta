using System;

namespace Picadito.Application.Features.Notifications.Queries.GetAllNotifications;

/// <summary>
/// Query para obtener las notificaciones del usuario autenticado con filtros y paginación.
/// </summary>
public class GetAllNotificationsQuery
{
    /// <summary>
    /// Filtro por estado de lectura (opcional).
    /// </summary>
    public bool? IsRead { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
