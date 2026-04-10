using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Picadito.Infrastructure.Persistence.Repositories;

public class PitchRepository(ApplicationDbContext context) : IPitchRepository
{
    public async Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken)
    {
        // Verificamos si existe la relación en la tabla de Canchas (Pitches) o Predios (Venues)
        // Suponiendo que Pitch tiene un VenueId y Venue tiene el OwnerId:
        return await context.Pitches
            .AnyAsync(p => p.Id == pitchId && p.Venue.OwnerId == userId, cancellationToken);
    }
    
    public async Task<List<PitchDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        // Obtenemos todas las canchas activas incluyendo el Venue asociado
        // El filtro global de DeletedAt ya filtra las canchas eliminadas
        var pitches = await context.Pitches
            .IgnoreQueryFilters() // Necesario para incluir canchas inactivas si se requiere, 
                                  // pero el filtro global ya excluye DeletedAt != null
            .Where(p => p.IsActive)
            .Include(p => p.Venue)
            .Select(p => new PitchDto
            {
                Id = p.Id,
                Name = p.Name,
                VenueId = p.VenueId,
                VenueName = p.Venue.Name,
                Type = p.Type.ToString(),
                Surface = p.Surface.ToString(),
                PricePerHour = p.PricePerHour,
                IsActive = p.IsActive
            })
            .ToListAsync(cancellationToken);

        return pitches;
    }
}
