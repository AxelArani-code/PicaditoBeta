using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;

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
}
