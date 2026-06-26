using System.Diagnostics;
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

public class VenueClosureRepository : IVenueClosureRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VenueClosureRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public VenueClosureRepository(ApplicationDbContext context, ILogger<VenueClosureRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(VenueClosure closure, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        await _context.Set<VenueClosure>().AddAsync(closure, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Venue closure created successfully. ClosureId: {ClosureId}, PitchId: {PitchId}, IsAdmin: {IsAdmin}",
            closure.Id, closure.PitchId, isAdmin);

        return closure.Id;
    }

    public async Task<bool> PitchExistsAndIsActiveAsync(Guid pitchId, CancellationToken cancellationToken)
    {
        return await _context.Pitches
            .AnyAsync(p => p.Id == pitchId && p.DeletedAt == null, cancellationToken);
    }

    public async Task<bool> IsPitchOwnerAsync(Guid pitchId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Pitches
            .AnyAsync(p => p.Id == pitchId && p.Venue.OwnerId == userId && p.DeletedAt == null, cancellationToken);
    }

    public async Task<bool> IsOwnerAsync(Guid closureId, Guid userId, CancellationToken cancellationToken)
    {
        // Verifica si el usuario es dueño del venue asociado al cierre
        // Si pitch_id es NULL (cierre global), cualquier venue del owner califica
        return await _context.Set<VenueClosure>()
            .AnyAsync(vc => vc.Id == closureId && (
                vc.Pitch == null
                    ? _context.Venues.Any(v => v.OwnerId == userId && v.DeletedAt == null)
                    : vc.Pitch.Venue.OwnerId == userId
            ), cancellationToken);
    }

    public async Task<ErrorOr<PagedResponse<VenueClosureDto>>> GetAllAsync(
        Guid? pitchId,
        DateOnly? fromDate,
        DateOnly? toDate,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var query = _context.Set<VenueClosure>()
                .Include(vc => vc.Pitch)
                .ThenInclude(p => p!.Venue)
                .AsQueryable();

            // Filtro de seguridad según RLS: venue owners solo ven sus propios cierres
            if (userRole == UserRole.venue_owner)
            {
                query = query.Where(vc =>
                    vc.Pitch == null
                        ? _context.Venues.Any(v => v.OwnerId == currentUserId && v.DeletedAt == null)
                        : vc.Pitch.Venue.OwnerId == currentUserId);
            }

            // Filtros opcionales
            if (pitchId.HasValue)
            {
                query = query.Where(vc => vc.PitchId == pitchId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(vc => vc.ClosureDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(vc => vc.ClosureDate <= toDate.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var skip = (pageNumber - 1) * pageSize;

            var closures = await query
                .OrderByDescending(vc => vc.ClosureDate)
                .ThenByDescending(vc => vc.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(vc => new VenueClosureDto
                {
                    Id = vc.Id,
                    PitchId = vc.PitchId,
                    PitchName = vc.Pitch != null ? vc.Pitch.Name : "(Todo el complejo)",
                    VenueName = vc.Pitch != null ? vc.Pitch.Venue.Name : string.Empty,
                    ClosureDate = vc.ClosureDate.ToString("yyyy-MM-dd"),
                    StartTime = vc.StartTime.HasValue ? vc.StartTime.Value.ToString(@"hh\:mm") : null,
                    EndTime = vc.EndTime.HasValue ? vc.EndTime.Value.ToString(@"hh\:mm") : null,
                    Reason = vc.Reason,
                    CreatedAt = vc.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, PitchId={PitchId}, FromDate={FromDate}, ToDate={ToDate}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, pitchId, fromDate, toDate, closures.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, closures.Count, totalCount);
            }

            return new PagedResponse<VenueClosureDto>(
                Items: closures,
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
                "GetAllAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, PitchId={PitchId}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, pitchId);
            throw;
        }
    }

    public async Task<VenueClosure?> GetEntityByIdAsync(Guid closureId, CancellationToken cancellationToken)
    {
        return await _context.Set<VenueClosure>()
            .FirstOrDefaultAsync(vc => vc.Id == closureId, cancellationToken);
    }

    public async Task<ErrorOr<VenueClosureDto>> GetByIdAsync(
        Guid closureId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken)
    {
        var query = _context.Set<VenueClosure>()
            .Include(vc => vc.Pitch)
            .ThenInclude(p => p!.Venue)
            .Where(vc => vc.Id == closureId);

        // Filtro de seguridad según RLS
        if (userRole == UserRole.venue_owner)
        {
            query = query.Where(vc =>
                vc.Pitch == null
                    ? _context.Venues.Any(v => v.OwnerId == currentUserId && v.DeletedAt == null)
                    : vc.Pitch.Venue.OwnerId == currentUserId);
        }

        var closure = await query
            .Select(vc => new VenueClosureDto
            {
                Id = vc.Id,
                PitchId = vc.PitchId,
                PitchName = vc.Pitch != null ? vc.Pitch.Name : "(Todo el complejo)",
                VenueName = vc.Pitch != null ? vc.Pitch.Venue.Name : string.Empty,
                ClosureDate = vc.ClosureDate.ToString("yyyy-MM-dd"),
                StartTime = vc.StartTime.HasValue ? vc.StartTime.Value.ToString(@"hh\:mm") : null,
                EndTime = vc.EndTime.HasValue ? vc.EndTime.Value.ToString(@"hh\:mm") : null,
                Reason = vc.Reason,
                CreatedAt = vc.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (closure is null)
        {
            return userRole == UserRole.venue_owner
                ? DomainErrors.VenueClosure.Forbidden
                : DomainErrors.VenueClosure.NotFound;
        }

        return closure;
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid closureId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        var closure = await _context.Set<VenueClosure>()
            .FirstOrDefaultAsync(vc => vc.Id == closureId, cancellationToken);

        if (closure is null)
        {
            return DomainErrors.VenueClosure.NotFound;
        }

        _context.Set<VenueClosure>().Remove(closure);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Venue closure deleted successfully. ClosureId: {ClosureId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
            closureId, currentUserId, isAdmin);

        return Result.Success;
    }
}
