namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para la entidad TimeSlot.
/// Incluye datos desnormalizados del Pitch para facilitar el consumo en el frontend.
/// </summary>
public class TimeSlotDto
{
    public Guid Id { get; set; }
    public Guid PitchId { get; set; }
    public string PitchName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
