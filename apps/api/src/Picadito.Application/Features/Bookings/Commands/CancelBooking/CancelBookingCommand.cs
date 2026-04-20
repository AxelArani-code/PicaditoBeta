namespace Picadito.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// Comando para cancelar una reserva.
/// </summary>
public class CancelBookingCommand
{
    /// <summary>
    /// Identificador de la reserva a cancelar.
    /// </summary>
    public Guid Id { get; init; }
}