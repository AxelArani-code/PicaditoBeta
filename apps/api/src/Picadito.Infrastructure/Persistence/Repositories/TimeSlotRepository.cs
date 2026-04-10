using System;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Interfaces;
namespace Picadito.Infrastructure.Persistence.Repositories;

public class TimeSlotRepository(ApplicationDbContext context): ITimeSlotRepository
{
    public async Task<TimeSlotDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var timeSlot = await context.TimeSlots.FindAsync(id, cancellationToken);
        return timeSlot == null ? null : new TimeSlotDto
        {
            Id = timeSlot.Id,
            PitchId = timeSlot.PitchId,
            Date = timeSlot.Date,
            Price = timeSlot.Price,
            Status = timeSlot.Status
        };
    }
}
