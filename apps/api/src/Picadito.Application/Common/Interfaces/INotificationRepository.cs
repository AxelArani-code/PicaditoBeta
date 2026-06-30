using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de notificaciones.
/// </summary>
public interface INotificationRepository
{
    /// <summary>
    /// Crea una nueva notificación.
    /// </summary>
    Task<ErrorOr<Guid>> AddAsync(Notification notification, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene las notificaciones de un usuario con paginación.
    /// </summary>
    Task<ErrorOr<PagedResponse<NotificationDto>>> GetAllAsync(
        Guid userId,
        bool? isRead,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene una notificación por su ID.
    /// </summary>
    Task<NotificationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene la entidad Notification por su ID.
    /// </summary>
    Task<Notification?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Actualiza una notificación (marcar como leída).
    /// </summary>
    Task<ErrorOr<Success>> UpdateAsync(Notification notification, CancellationToken cancellationToken);

    /// <summary>
    /// Elimina una notificación.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
