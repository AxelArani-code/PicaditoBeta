namespace Picadito.Domain.Entities;

public class VenueClosure
{
    public Guid Id { get; private set; }

    // NULL si cierra todo el complejo (global), GUID si es una cancha específica
    public Guid? PitchId { get; private set; }

    public DateOnly ClosureDate { get; private set; }

    // NULL significa que el cierre aplica todo el día
    public TimeSpan? StartTime { get; private set; }

    // NULL significa que el cierre aplica todo el día
    public TimeSpan? EndTime { get; private set; }

    public string? Reason { get; private set; }

    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    // Relación de navegación opcional (puede ser NULL para cierres globales)
    public virtual Pitch? Pitch { get; private set; }

    private VenueClosure() { }

    public VenueClosure(
        Guid? pitchId,
        DateOnly closureDate,
        TimeSpan? startTime,
        TimeSpan? endTime,
        string? reason = null)
    {
        Id = Guid.NewGuid();
        PitchId = pitchId;
        ClosureDate = closureDate;
        StartTime = startTime;
        EndTime = endTime;
        Reason = reason;
        CreatedAt = DateTime.UtcNow;
    }
}
