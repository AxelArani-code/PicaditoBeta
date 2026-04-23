using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Picadito.Infrastructure.Persistence.Repositories;

public class PitchRepository : IPitchRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PitchRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public PitchRepository(ApplicationDbContext context, ILogger<PitchRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Pitches
            .AnyAsync(p => p.Id == pitchId && p.Venue.OwnerId == userId, cancellationToken);
    }
    
    public async Task<List<PitchDto>> GetAllAsync(
        Guid? venueId, 
        string? type, 
        string? surface,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var query = _context.Pitches
                .Where(p => p.IsActive)
                .Include(p => p.Venue)
                .AsQueryable();
        
            if (venueId.HasValue)
            {
                query = query.Where(p => p.VenueId == venueId.Value);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(p => p.Type.ToString() == type);
            }

            if (!string.IsNullOrEmpty(surface))
            {
                query = query.Where(p => p.Surface.ToString() == surface);
            }

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

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync: ElapsedMs={ElapsedMs}, VenueId={VenueId}, Type={Type}, Surface={Surface}, Count={Count}",
                    elapsedMs, venueId, type, surface, pitches.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync completed: ElapsedMs={ElapsedMs}, Count={Count}",
                    elapsedMs, pitches.Count);
            }

            return pitches;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetAllAsync error: ElapsedMs={ElapsedMs}, VenueId={VenueId}, Type={Type}, Surface={Surface}",
                sw.ElapsedMilliseconds, venueId, type, surface);
            throw;
        }
    }
}
