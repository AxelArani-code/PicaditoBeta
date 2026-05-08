using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Domain.Enums;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de reservas.
/// </summary>
public interface IBookingRepository
{
    /// <summary>
    /// Crea una nueva reserva.
    /// </summary>
    /// <param name="booking">Entidad de la reserva a crear.</param>
    /// <param name="currentUserId">ID del usuario autenticado que realiza la operación.</param>
    /// <param name="isAdmin">Indica si el usuario tiene rol de administrador.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>El ID de la reserva creada o un error.</returns>
    Task<ErrorOr<Guid>> AddAsync(Booking booking, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);
    
    /// <summary>
    /// Obtiene todas las reservas con filtros opcionales y paginación.
    /// Aplica seguridad por roles: admin ve todo, venue_owner ve sus complejos, player ve solo sus reservas.
    /// </summary>
    /// <param name="currentUserId">ID del usuario autenticado que realiza la consulta.</param>
    /// <param name="userRole">Rol del usuario para aplicar filtros de seguridad.</param>
    /// <param name="status">Filtro por estado de la reserva.</param>
    /// <param name="paymentStatus">Filtro por estado de pago.</param>
    /// <param name="pitchId">Filtro por ID de la cancha.</param>
    /// <param name="pageNumber">Número de página a obtener (comienza en 1).</param>
    /// <param name="pageSize">Cantidad de elementos por página.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con las reservas y metadata de paginación.</returns>
    Task<ErrorOr<PagedResponse<BookingDto>>> GetAllAsync(
        Guid currentUserId,
        UserRole userRole,
        string? status,
        string? paymentStatus,
        Guid? pitchId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Actualiza el estado de una reserva.
    /// Valida que el usuario sea el propietario del complejo.
    /// </summary>
    /// <param name="id">ID de la reserva.</param>
    /// <param name="newStatus">Nuevo estado.</param>
    /// <param name="ownerId">ID del propietario que realiza la acción.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success o error de autorización/no encontrado.</returns>
    Task<ErrorOr<Success>> UpdateStatusAsync(
        Guid id,
        BookingStatus newStatus,
        Guid ownerId,
        bool isAdmin,
        CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si existe una reserva activa (pendiente o confirmada) para un horario específico.          
    /// </summary>
    /// <param name="timeSlotId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<bool> ExistsActiveBookingForSlotAsync(Guid timeSlotId, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene una reserva por su ID con las relaciones necesarias para verificar propiedad.
    /// </summary>
    /// <param name="id">ID de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>La reserva con Pitch -> Venue cargados, o null si no existe.</returns>
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Cancela una reserva confirmada.
    /// Solo el owner del complejo puede cancelar reservas confirmadas.
    /// </summary>
    /// <param name="id">ID de la reserva.</param>
    /// <param name="ownerId">ID del propietario que realiza la acción.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success o error de autorización/no encontrado/no confirmada.</returns>
    Task<ErrorOr<Success>> CancelAsync(
        Guid id,
        Guid ownerId,
        bool isAdmin,
        CancellationToken cancellationToken);
    /// <summary>
    /// Obtiene una reserva por su ID con la información del Venue para validar la propiedad.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task<Booking?> GetByIdWithVenueAsync(Guid id, CancellationToken cancellationToken);
}
