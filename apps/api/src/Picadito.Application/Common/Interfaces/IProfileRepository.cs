using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IProfileRepository
{
    Task<Profile?> GetByIdAsync(Guid profileId, CancellationToken cancellationToken);

    Task<ErrorOr<ProfileDto>> GetMyProfileAsync(Guid userId, CancellationToken cancellationToken);

    Task<ErrorOr<ProfileDto>> GetProfileByIdAsync(Guid profileId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<ErrorOr<PagedResponse<ProfileDto>>> GetAllAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<ErrorOr<Success>> UpdateAsync(Profile profile, CancellationToken cancellationToken);

    Task<bool> IsUsernameTakenAsync(string username, Guid excludeProfileId, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> DeleteAsync(Guid profileId, CancellationToken cancellationToken);
}
