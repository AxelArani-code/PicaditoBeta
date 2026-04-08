using System;

namespace Picadito.Application.DTOs;

public class TimeSlotDto
{
    public Guid Id { get; set; }
    public Guid PitchId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Price { get; set; }
    public string Status { get; set; } = default!;
}
