namespace Picadito.Domain.Entities;

public class AvailabilityRule
{
    public Guid Id { get; private set; }
    public Guid PitchId { get; private set; }
    public DayOfWeek DayOfWeek { get; private set; }
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }
    public decimal? PriceOverride { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public virtual Pitch Pitch { get; private set; } = null!;

    private AvailabilityRule() { }

    public AvailabilityRule(
        Guid pitchId,
        DayOfWeek dayOfWeek,
        TimeSpan startTime,
        TimeSpan endTime,
        decimal? priceOverride = null)
    {
        Id = Guid.NewGuid();
        PitchId = pitchId;
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
        PriceOverride = priceOverride;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        DayOfWeek dayOfWeek,
        TimeSpan startTime,
        TimeSpan endTime,
        decimal? priceOverride = null)
    {
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
        PriceOverride = priceOverride;
    }
}
