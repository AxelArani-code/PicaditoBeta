namespace Picadito.Application.Features.Bookings.Commands.RejectBooking;

/// <summary>
/// Comando para rechazar una reserva.
/// </summary>
public class RejectBookingCommand
{
    /// <summary>
    /// Identificador de la reserva a rechazar.
    /// </summary>
    public Guid Id { get; init; }
}
