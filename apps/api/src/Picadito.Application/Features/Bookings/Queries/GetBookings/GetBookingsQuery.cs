namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Query para obtener reservas con filtros opcionales y paginación.
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
    
    /// <summary>
    /// Número de página a solicitar (comienza en 1). Por defecto: 1.
    /// </summary>
    public int PageNumber { get; init; } = 1;
    
    /// <summary>
    /// Cantidad de elementos por página. Por defecto: 20.
    /// </summary>
    public int PageSize { get; init; } = 20;
}
