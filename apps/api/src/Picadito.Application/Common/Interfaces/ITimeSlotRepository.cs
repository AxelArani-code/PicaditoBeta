using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface ITimeSlotRepository
{
    Task<ErrorOr<Guid>> AddAsync(TimeSlot timeSlot, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> PitchExistsAndIsActiveAsync(Guid pitchId, CancellationToken cancellationToken);

    Task<bool> IsPitchOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);

    Task<ErrorOr<PagedResponse<TimeSlotDto>>> GetAllAsync(
        Guid? pitchId,
        DateOnly? date,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<TimeSlot?> GetEntityByIdAsync(Guid slotId, CancellationToken cancellationToken);

    Task<ErrorOr<TimeSlotDto>> GetByIdAsync(Guid slotId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken);

    Task<bool> HasOverlappingSlotAsync(Guid pitchId, DateOnly date, TimeSpan startTime, TimeSpan endTime, CancellationToken cancellationToken);
}
