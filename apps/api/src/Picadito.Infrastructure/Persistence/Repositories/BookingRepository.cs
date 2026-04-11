using System;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.EntityFrameworkCore;

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
}
