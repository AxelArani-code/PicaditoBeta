namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Query para obtener reservas con filtros opcionales.
/// </summary>
public class GetBookingsQuery
{
    /// <summary>
    /// Filtrar por estado de la reserva (pending, confirmed, rejected, cancelled).
    /// </summary>
    public string? Status { get; init; }
    
    /// <summary>
    /// Filtrar por estado de pago (pending, paid, refunded, etc.).
    /// </summary>
    public string? PaymentStatus { get; init; }
    
    /// <summary>
    /// Filtrar por ID de la cancha.
    /// </summary>
    public Guid? PitchId { get; init; }
}
