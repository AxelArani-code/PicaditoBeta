using System;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

/// <summary>
/// Implementación del repositorio de reservas usando EF Core.
/// </summary>
public class BookingRepository(ApplicationDbContext context) : IBookingRepository
{
    public async Task AddAsync(Booking booking, CancellationToken cancellationToken)
    {
        await context.Bookings.AddAsync(booking, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<BookingDto>> GetAllAsync(
        string? status,
        string? paymentStatus,
        Guid? pitchId,
        CancellationToken cancellationToken)
    {
        IQueryable<Booking> query = context.Bookings
            .AsNoTracking()
            .Include(b => b.Pitch)
            .Include(b => b.User);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status.ToString().ToLower() == status.ToLower());
        }

        if (!string.IsNullOrEmpty(paymentStatus))
        {
            query = query.Where(b => b.PaymentStatus.ToLower() == paymentStatus.ToLower());
        }

        if (pitchId.HasValue)
        {
            query = query.Where(b => b.PitchId == pitchId.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                TimeSlotId = b.TimeSlotId,
                PitchId = b.PitchId,
                PitchName = b.Pitch.Name,
                UserId = b.UserId,
                UserName = b.User.FullName,
                Date = b.Date,
                TotalPrice = b.TotalPrice,
                Status = b.Status.ToString().ToLower(),
                PaymentStatus = b.PaymentStatus,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return bookings;
    }

    /// <summary>
    /// Actualiza el estado de una reserva.
    /// Valida que el usuario sea el propietario del complejo asociado a la reserva.
    /// </summary>
    public async Task<ErrorOr<Success>> UpdateStatusAsync(
        Guid id,
        BookingStatus newStatus,
        Guid ownerId,
        CancellationToken cancellationToken)
    {
        // Cargamos la reserva con su Pitch y Venue para validar propiedad
        var booking = await context.Bookings
            .Include(b => b.Pitch)
                .ThenInclude(p => p.Venue)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (booking == null)
        {
            return Error.NotFound("Booking.NotFound", "La reserva no fue encontrada.");
        }

        // Verificar que la reserva esté en estado pending (solo se pueden confirmar/rechazar reservas pendientes)
        if (booking.Status != BookingStatus.pending)
        {
            return Error.Conflict(
                "Booking.InvalidState",
                $"No se puede cambiar el estado de una reserva que ya está '{booking.Status}'.");
        }

        // Verificar que el usuario sea el propietario del Venue
        // IMPORTANTE: Esta validación es crítica para la seguridad
        if (booking.Pitch.Venue.OwnerId != ownerId)
        {
            return Error.Unauthorized(
                "Booking.NotAuthorized",
                "No tienes permisos para modificar esta reserva.");
        }

        // Actualizar el estado usando el método del dominio
        // IMPORTANTE: Usamos el método UpdateStatus() que modifica la propiedad Status
        // para que EF Core detecte el cambio y envíe la columna 'status' en el UPDATE SQL
        // Esto es crítico para que se dispare el trigger 'booking_status_changed' en PostgreSQL
        booking.UpdateStatus(newStatus);

        // Marcamos la entidad como modificada para asegurar que se envíen todos los valores
        context.Bookings.Update(booking);

        // Guardamos los cambios - EF Core generará el UPDATE SQL con la columna status
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }

    public async Task<bool> ExistsActiveBookingForSlotAsync(Guid timeSlotId, CancellationToken cancellationToken)
    {
        // Buscamos solo reservas que NO sean rechazadas ni canceladas
        return await context.Bookings
        .AnyAsync(b => b.TimeSlotId == timeSlotId && 
                  (b.Status == BookingStatus.pending || b.Status == BookingStatus.confirmed), 
                  cancellationToken);
    }
}
