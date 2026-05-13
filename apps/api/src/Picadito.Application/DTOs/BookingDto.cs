namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar una reserva en las respuestas de la API.
/// </summary>
public class BookingDto
{
    public Guid Id { get; set; }
    public Guid TimeSlotId { get; set; }
    public Guid PitchId { get; set; }
    public string PitchName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
