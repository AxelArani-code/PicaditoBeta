using System;
using Picadito.Domain.Enums;
namespace Picadito.Domain.Entities;

public class Booking
{
    public Guid Id { get; private set; }
    public Guid TimeSlotId { get; private set; }
    public Guid PitchId { get; private set; }
    public DateOnly Date { get; private set; }
    public Guid UserId { get; private set; }
    public decimal TotalPrice { get; private set; } 


    public Booking(
        Guid timeSlotId,
        Guid pitchId,
        DateOnly date,
        Guid userId,
        decimal totalPrice)
    {
        Id = Guid.NewGuid();
        TimeSlotId = timeSlotId;
        PitchId = pitchId;
        Date = date;
        UserId = userId;
        TotalPrice = totalPrice;
    }
}
