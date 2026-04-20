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
        CancellationToken cancellationToken);
}
