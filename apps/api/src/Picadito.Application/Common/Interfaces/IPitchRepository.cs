using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IPitchRepository
{
    Task<ErrorOr<Guid>> AddAsync(Pitch pitch, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);
    
    Task<ErrorOr<PagedResponse<PitchDto>>> GetAllAsync(
        Guid? venueId,
        string? type,
        string? surface,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Pitch?> GetPitchByIdAsync(Guid pitchId, CancellationToken cancellationToken);

    Task<ErrorOr<PitchDto>> GetPitchByIdWithVenueAsync(Guid pitchId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> UpdateAsync(Pitch pitch, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> DeleteAsync(Guid pitchId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);
}
