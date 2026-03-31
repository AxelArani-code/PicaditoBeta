using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(IBookingRepository bookingRepository, ITimeSlotRepository timeSlotRepository)
{
    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        // Paso: Buscamos el TimeSlot en la base de datos
        var timeSlot = await timeSlotRepository.GetByIdAsync(request.TimeSlotId, cancellationToken);

        // Validaction
        if (timeSlot == null)
            throw new Exception("No se encontró el TimeSlot especificado.");
        if (timeSlot.Status != "available")
            throw new Exception("TimeSlot no esta disponible para reserva.");

        // 1. Mapear de Command a Entidad de Dominio
        var booking = new Booking(
            request.TimeSlotId,
            timeSlot.PitchId,
            timeSlot.Date,
            request.UserId,
            timeSlot.Price);

        // 2. Persistir usando el repositorio (EF Core)
        await bookingRepository.AddAsync(booking, cancellationToken);

        // 3. Retornar el ID generado
        return booking.Id;
    }
}
