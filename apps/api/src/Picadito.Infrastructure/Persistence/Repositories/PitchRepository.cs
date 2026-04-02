using System;
using Picadito.Application.Common.Interfaces;
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
}
