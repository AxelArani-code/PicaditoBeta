namespace Picadito.Application.Features.Bookings.Commands.ConfirmBooking;

/// <summary>
/// Comando para confirmar una reserva.
/// </summary>
public class ConfirmBookingCommand
{
    /// <summary>
    /// Identificador de la reserva a confirmar.
    /// </summary>
    public Guid Id { get; init; }
}
