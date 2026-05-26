using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IMatchRepository
{
    Task<ErrorOr<Guid>> AddAsync(Match match, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> IsVenueOwnerAsync(Guid venueId, Guid userId, CancellationToken cancellationToken);

    Task<bool> BookingExistsAndIsConfirmedAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<bool> BookingAlreadyHasMatchAsync(Guid bookingId, CancellationToken cancellationToken);

    Task<ErrorOr<PagedResponse<MatchDto>>> GetAllAsync(
        Guid? venueId,
        DateOnly? date,
        string? status,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Match?> GetEntityByIdAsync(Guid matchId, CancellationToken cancellationToken);

    Task<ErrorOr<MatchDto>> GetByIdAsync(Guid matchId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> UpdateAsync(Match match, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);
}
