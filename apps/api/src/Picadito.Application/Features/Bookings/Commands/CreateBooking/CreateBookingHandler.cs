using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(IBookingRepository bookingRepository)
{
    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        // 1. Mapear de Command a Entidad de Dominio
        var booking = new Booking(
            request.TimeSlotId,
            request.PitchId,
            request.Date,
            request.UserId,
            request.TotalPrice);

        // 2. Persistir usando el repositorio (EF Core)
        await bookingRepository.AddAsync(booking, cancellationToken);

        // 3. Retornar el ID generado
        return booking.Id;
    }
}
