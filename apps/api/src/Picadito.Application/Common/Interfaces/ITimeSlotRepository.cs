using System;
using Picadito.Application.DTOs;
namespace Picadito.Application.Common.Interfaces;

public interface ITimeSlotRepository
{
    Task<TimeSlotDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
