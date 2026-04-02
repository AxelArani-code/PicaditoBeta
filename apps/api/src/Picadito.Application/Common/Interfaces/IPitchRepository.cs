using System;

namespace Picadito.Application.Common.Interfaces;

public interface IPitchRepository
{
    Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);
}
