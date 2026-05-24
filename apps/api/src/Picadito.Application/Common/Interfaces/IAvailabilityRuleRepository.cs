using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

public interface IAvailabilityRuleRepository
{
    Task<ErrorOr<Guid>> AddAsync(AvailabilityRule rule, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<bool> PitchExistsAndIsActiveAsync(Guid pitchId, CancellationToken cancellationToken);

    Task<bool> IsPitchOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);

    Task<bool> IsOwnerAsync(Guid ruleId, Guid userId, CancellationToken cancellationToken);

    Task<ErrorOr<PagedResponse<AvailabilityRuleDto>>> GetAllAsync(
        Guid? pitchId,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    Task<AvailabilityRule?> GetEntityByIdAsync(Guid ruleId, CancellationToken cancellationToken);

    Task<ErrorOr<AvailabilityRuleDto>> GetByIdAsync(Guid ruleId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> UpdateAsync(AvailabilityRule rule, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);

    Task<ErrorOr<Success>> DeleteAsync(Guid ruleId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken);
}
