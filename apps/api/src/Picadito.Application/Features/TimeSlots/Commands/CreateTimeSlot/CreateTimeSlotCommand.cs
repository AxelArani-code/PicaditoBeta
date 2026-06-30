namespace Picadito.Application.Features.TimeSlots.Commands.CreateTimeSlot;

/// <summary>
/// Comando para crear un nuevo turno (TimeSlot) en una cancha.
/// </summary>
public class CreateTimeSlotCommand
{
    public Guid PitchId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
