using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Picadito.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

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

    public async Task<ErrorOr<Guid>> AddAsync(Pitch pitch, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        if (!isAdmin)
        {
            var isOwner = await _context.Venues
                .AnyAsync(v => v.Id == pitch.VenueId && v.OwnerId == currentUserId && v.DeletedAt == null, cancellationToken);
            if (!isOwner)
            {
                _logger.LogWarning(
                    "Unauthorized pitch creation attempt. VenueId: {VenueId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
                    pitch.VenueId, currentUserId, isAdmin);
                return Error.Unauthorized("Pitch.Unauthorized", "No tienes permisos para crear canchas en este complejo.");
            }
        }

        await _context.Pitches.AddAsync(pitch, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Pitch created successfully. PitchId: {PitchId}, VenueId: {VenueId}, IsAdmin: {IsAdmin}",
            pitch.Id, pitch.VenueId, isAdmin);

        return pitch.Id;
    }

    public async Task<bool> IsOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Pitches
            .AnyAsync(p => p.Id == pitchId && p.Venue.OwnerId == userId, cancellationToken);
    }
    
    public async Task<ErrorOr<PagedResponse<PitchDto>>> GetAllAsync(
        Guid? venueId,
        string? type,
        string? surface,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var query = _context.Pitches
                .Include(p => p.Venue)
                .AsQueryable();

            if (userRole == UserRole.admin)
            {
            }
            else if (userRole == UserRole.venue_owner)
            {
                query = query.Where(p => p.Venue.OwnerId == currentUserId);
            }
            else
            {
                query = query.Where(p => p.IsActive);
            }

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

            var totalCount = await query.CountAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var skip = (pageNumber - 1) * pageSize;

            var pitches = await query
                .OrderByDescending(p => p.CreatedAt)
                .ThenBy(p => p.Id)
                .Skip(skip)
                .Take(pageSize)
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
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, VenueId={VenueId}, Type={Type}, Surface={Surface}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, venueId, type, surface, pitches.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, pitches.Count, totalCount);
            }

            return new PagedResponse<PitchDto>(
                Items: pitches,
                PageNumber: pageNumber,
                PageSize: pageSize,
                TotalCount: totalCount,
                TotalPages: totalPages);
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetAllAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, VenueId={VenueId}, Type={Type}, Surface={Surface}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, venueId, type, surface);
            throw;
        }
    }

    public async Task<Pitch?> GetPitchByIdAsync(Guid pitchId, CancellationToken cancellationToken)
    {
        return await _context.Pitches
            .FirstOrDefaultAsync(p => p.Id == pitchId, cancellationToken);
    }

    public async Task<ErrorOr<PitchDto>> GetPitchByIdWithVenueAsync(Guid pitchId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken)
    {
        var query = _context.Pitches
            .Include(p => p.Venue)
            .Where(p => p.Id == pitchId);

        if (userRole == UserRole.venue_owner)
        {
            query = query.Where(p => p.Venue.OwnerId == currentUserId);
        }
        else if (userRole == UserRole.player)
        {
            query = query.Where(p => p.IsActive);
        }

        var pitch = await query
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
            .FirstOrDefaultAsync(cancellationToken);

        if (pitch is null)
        {
            return userRole == UserRole.venue_owner 
                ? DomainErrors.Pitch.Forbidden 
                : DomainErrors.Pitch.NotFound;
        }

        return pitch;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Pitch pitch, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        _context.Pitches.Update(pitch);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Pitch updated successfully. PitchId: {PitchId}, VenueId: {VenueId}, IsAdmin: {IsAdmin}",
            pitch.Id, pitch.VenueId, isAdmin);

        return Result.Success;
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid pitchId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        var pitch = await _context.Pitches
            .FirstOrDefaultAsync(p => p.Id == pitchId, cancellationToken);

        if (pitch is null)
        {
            return DomainErrors.Pitch.NotFound;
        }

        var hasActiveBookings = await _context.Bookings
            .AnyAsync(b => b.PitchId == pitchId && (b.Status == BookingStatus.pending || b.Status == BookingStatus.confirmed), cancellationToken);

        if (hasActiveBookings)
        {
            _logger.LogWarning(
                "Cannot delete pitch with active bookings. PitchId: {PitchId}, CurrentUserId: {CurrentUserId}",
                pitchId, currentUserId);
            return DomainErrors.Pitch.CannotDelete;
        }

        pitch.GetType().GetProperty("DeletedAt")!.SetValue(pitch, DateTime.UtcNow);
        pitch.GetType().GetProperty("IsActive")!.SetValue(pitch, false);
        
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Pitch deleted successfully. PitchId: {PitchId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
            pitchId, currentUserId, isAdmin);

        return Result.Success;
    }
}
