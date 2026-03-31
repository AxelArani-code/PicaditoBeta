using System;

namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

// Esta clase representa el comando para crear una nueva reserva. 
// Contiene las propiedades necesarias para crear una reserva.
public class CreateBookingCommand
{
    public Guid TimeSlotId { get; set; }
    public Guid UserId { get; set; }
}
