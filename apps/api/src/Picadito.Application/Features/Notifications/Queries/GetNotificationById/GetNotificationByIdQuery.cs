using System;

namespace Picadito.Application.Features.Notifications.Queries.GetNotificationById;

/// <summary>
/// Query para obtener una notificación por su ID.
/// </summary>
public class GetNotificationByIdQuery
{
    public Guid Id { get; set; }
}
