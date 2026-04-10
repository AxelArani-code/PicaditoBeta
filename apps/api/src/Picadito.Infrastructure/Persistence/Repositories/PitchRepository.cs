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
    
    public async Task<List<PitchDto>> GetAllAsync(
        Guid? venueId, 
        string? type, 
        string? surface,
        CancellationToken cancellationToken)
    {
        // Obtenemos todas las canchas activas incluyendo el Venue asociado
        // Usamos IQueryable para poder añadir filtros condicionales después
        var query = context.Pitches
            .Where(p => p.IsActive)
            .Include(p => p.Venue)
            .AsQueryable();
        
         // Filtro por Complejo (Venue)
        if (venueId.HasValue)
        {
            query = query.Where(p => p.VenueId == venueId.Value);
        }

        // Filtro por Tipo de Cancha
        if (!string.IsNullOrEmpty(type))
        {
            // Al ser Enum, comparamos contra el valor en string que guardamos en la DB
            query = query.Where(p => p.Type.ToString() == type);
        }

        // Filtro por Superficie
        if (!string.IsNullOrEmpty(surface))
        {
            query = query.Where(p => p.Surface.ToString() == surface);
        }

        // Ejecutamos la proyección y la consulta final
        var pitches = await query
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
