using System;
using Picadito.Application.DTOs;

namespace Picadito.Application.Common.Interfaces;

public interface IPitchRepository
{
    Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken);
    
    /// Obtiene todas las canchas activas con información del Venue asociado.
    /// Se incluye filtros opcionales nullables.
    Task<List<PitchDto>> GetAllAsync(
        Guid? venueId, 
        string? type, 
        string? surface, 
        CancellationToken cancellationToken);
}
