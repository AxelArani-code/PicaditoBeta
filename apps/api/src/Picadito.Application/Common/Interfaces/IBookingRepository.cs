using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de reservas.
/// </summary>
public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken cancellationToken);
    
    /// <summary>
    /// Obtiene todas las reservas con filtros opcionales.
    /// </summary>
    Task<List<BookingDto>> GetAllAsync(
        Guid currentUserId,
        UserRole userRole,
        string? status,
        string? paymentStatus,
        Guid? pitchId,
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
