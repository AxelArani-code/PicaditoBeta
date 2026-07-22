using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IVenueClosureRepository
{
    Task<ErrorOr<Guid>> AddAsync(VenueClosure closure, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> PitchExistsAndIsActiveAsync(Guid pitchId, CancellationToken cancellationToken);

    Task<bool> IsPitchOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);

    Task<bool> IsOwnerAsync(Guid closureId, Guid userId, CancellationToken cancellationToken);

    Task<ErrorOr<PagedResponse<VenueClosureDto>>> GetAllAsync(
        Guid? pitchId,
        DateOnly? fromDate,
        DateOnly? toDate,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<VenueClosure?> GetEntityByIdAsync(Guid closureId, CancellationToken cancellationToken);

    Task<ErrorOr<VenueClosureDto>> GetByIdAsync(Guid closureId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> DeleteAsync(Guid closureId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);
}
