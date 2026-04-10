using System;
using Picadito.Application.DTOs;

namespace Picadito.Application.Common.Interfaces;

public interface IPitchRepository
{
    Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);
    
    /// <summary>
    /// Obtiene todas las canchas activas con información del Venue asociado.
    /// </summary>
    Task<List<PitchDto>> GetAllAsync(CancellationToken cancellationToken);
}
