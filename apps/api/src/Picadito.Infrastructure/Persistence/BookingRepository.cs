using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
namespace Picadito.Infrastructure.Persistence;

public class BookingRepository(ApplicationDbContext context) : IBookingRepository
{
     public async Task AddAsync(Booking booking, CancellationToken cancellationToken)
    {
        // EF Core hace el seguimiento (tracking) de la entidad
        await context.Bookings.AddAsync(booking, cancellationToken);
        // Guarda los cambios en la DB (genera el INSERT SQL automáticamente)
        await context.SaveChangesAsync(cancellationToken);
    }
}
