using System;

namespace Picadito.Domain.Entities;
public class TimeSlot
{
    public Guid Id { get; private set; }
    public Guid PitchId { get; private set; }
    public DateOnly Date { get; private set; }
    public decimal Price { get; private set; }
    public string Status { get; private set; } = default!;
    
}
