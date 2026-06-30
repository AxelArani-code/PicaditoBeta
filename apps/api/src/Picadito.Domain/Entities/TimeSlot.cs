using Picadito.Domain.Enums;

namespace Picadito.Domain.Entities;

/// <summary>
/// Representa un turno disponible para reservar en una cancha.
/// Un TimeSlot pertenece a un Pitch y tiene una fecha y hora específica.
/// </summary>
public class TimeSlot
{
    public Guid Id { get; private set; }
    public Guid PitchId { get; private set; }
    public DateOnly Date { get; private set; }
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }
    public decimal Price { get; private set; }

    /// <summary>
    /// Estado del turno: available, booked, unavailable.
    /// Se almacena como string para compatibilidad con la BD (TEXT con CHECK).
    /// </summary>
    public string Status { get; private set; } = default!;

    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Relación de navegación: el turno pertenece a una cancha.
    /// </summary>
    public virtual Pitch Pitch { get; private set; } = null!;

    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private TimeSlot() { }

    /// <summary>
    /// Constructor para crear un nuevo turno.
    /// </summary>
    public TimeSlot(Guid pitchId, DateOnly date, TimeSpan startTime, TimeSpan endTime, decimal price)
    {
        Id = Guid.NewGuid();
        PitchId = pitchId;
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        Price = price;
        Status = SlotStatus.available.ToString();
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Actualiza el estado del turno.
    /// </summary>
    public void UpdateStatus(SlotStatus newStatus)
    {
        Status = newStatus.ToString();
    }
}
