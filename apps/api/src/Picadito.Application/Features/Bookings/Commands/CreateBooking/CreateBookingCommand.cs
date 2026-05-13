using System;

namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

/// <summary>
/// Comando para crear una nueva reserva.
/// </summary>
public class CreateBookingCommand
{
    public Guid TimeSlotId { get; set; }
    
    /// <summary>
    /// ID del usuario para quien se crea la reserva. Opcional - solo los administradores pueden usarlo.
    /// Si no se proporciona, se asignará automáticamente el ID del usuario logueado.
    /// </summary>
    public Guid? UserId { get; set; }
}
