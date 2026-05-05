using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

/// <summary>
/// Implementación del repositorio de complejos deportivos usando EF Core.
/// </summary>
public class VenueRepository : IVenueRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VenueRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public VenueRepository(ApplicationDbContext context, ILogger<VenueRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(Venue venue, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        // Validación de seguridad: solo permitir si es admin o si el dueño del nuevo recinto es el mismo que está logueado
        if (!isAdmin && venue.OwnerId != currentUserId)
        {
            _logger.LogWarning(
                "Unauthorized venue creation attempt. VenueOwnerId: {VenueOwnerId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
                venue.OwnerId, currentUserId, isAdmin);
            return Error.Unauthorized("Venue.Unauthorized", "No tienes permisos para crear este recinto.");
        }

        await _context.Venues.AddAsync(venue, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Venue created successfully. VenueId: {VenueId}, OwnerId: {OwnerId}, IsAdmin: {IsAdmin}",
            venue.Id, venue.OwnerId, isAdmin);

        return venue.Id;
    }

    public async Task<List<VenueDto>> GetAllAsync(
        string? name,
        string? address,
        bool? isActive,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            IQueryable<Venue> query = _context.Venues
                .AsNoTracking()
                .Include(v => v.Owner)
                .Include(v => v.Pitches);

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(v => v.Name.ToLower().Contains(name.ToLower()));
            }

            if (!string.IsNullOrEmpty(address))
            {
                query = query.Where(v => v.Address.ToLower().Contains(address.ToLower()));
            }

            if (isActive.HasValue)
            {
                query = query.Where(v => v.IsActive == isActive.Value);
            }

            var venues = await query
                .OrderBy(v => v.Name)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    Phone = v.Phone,
                    Images = v.Images ?? new List<string>(),
                    OwnerId = v.OwnerId,
                    OwnerName = v.Owner.FullName,
                    Description = v.Description,
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt,
                    PitchCount = v.Pitches.Count(p => p.DeletedAt == null)
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync: ElapsedMs={ElapsedMs}, Name={Name}, Address={Address}, IsActive={IsActive}, Count={Count}",
                    elapsedMs, name, address, isActive, venues.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync completed: ElapsedMs={ElapsedMs}, Count={Count}",
                    elapsedMs, venues.Count);
            }

            return venues;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetAllAsync error: ElapsedMs={ElapsedMs}, Name={Name}, Address={Address}, IsActive={IsActive}",
                sw.ElapsedMilliseconds, name, address, isActive);
            throw;
        }
    }

    public async Task<VenueDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var venue = await _context.Venues
                .AsNoTracking()
                .Include(v => v.Owner)
                .Include(v => v.Pitches.Where(p => p.DeletedAt == null))
                .Where(v => v.Id == id)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    Phone = v.Phone,
                    Images = v.Images ?? new List<string>(),
                    OwnerId = v.OwnerId,
                    OwnerName = v.Owner.FullName,
                    Description = v.Description,
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt,
                    PitchCount = v.Pitches.Count
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetByIdAsync: ElapsedMs={ElapsedMs}, VenueId={VenueId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetByIdAsync completed: ElapsedMs={ElapsedMs}, VenueId={VenueId}, Found={Found}",
                    elapsedMs, id, venue != null);
            }

            return venue;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetByIdAsync error: ElapsedMs={ElapsedMs}, VenueId={VenueId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<Venue?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Venues
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken)
    {
        return await _context.Venues
            .AnyAsync(v => v.Name.ToLower() == name.ToLower() && v.DeletedAt == null, cancellationToken);
    }

    public async Task<bool> IsOwnerAsync(Guid venueId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Venues
            .AnyAsync(v => v.Id == venueId && v.OwnerId == userId && v.DeletedAt == null, cancellationToken);
    }

    public async Task UpdateAsync(Venue venue, CancellationToken cancellationToken)
    {
        _context.Venues.Update(venue);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
        if (venue != null)
        {
            venue.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}