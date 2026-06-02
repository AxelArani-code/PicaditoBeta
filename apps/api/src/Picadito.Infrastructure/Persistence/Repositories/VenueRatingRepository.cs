using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

public class VenueRatingRepository : IVenueRatingRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VenueRatingRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public VenueRatingRepository(ApplicationDbContext context, ILogger<VenueRatingRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(VenueRating rating, CancellationToken cancellationToken)
    {
        await _context.VenueRatings.AddAsync(rating, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "VenueRating created. VenueRatingId: {VenueRatingId}, VenueId: {VenueId}, UserId: {UserId}, Rating: {Rating}",
            rating.Id, rating.VenueId, rating.UserId, rating.Rating);

        return rating.Id;
    }

    public async Task<ErrorOr<PagedResponse<VenueRatingDto>>> GetAllAsync(
        Guid? venueId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            IQueryable<VenueRating> query = _context.VenueRatings
                .AsNoTracking()
                .Include(vr => vr.Venue)
                .Include(vr => vr.User);

            if (venueId.HasValue)
            {
                query = query.Where(vr => vr.VenueId == venueId.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(vr => vr.UserId == userId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;

            var items = await query
                .OrderByDescending(vr => vr.CreatedAt)
                .ThenBy(vr => vr.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(vr => new VenueRatingDto
                {
                    Id = vr.Id,
                    VenueId = vr.VenueId,
                    VenueName = vr.Venue.Name,
                    UserId = vr.UserId,
                    UserName = vr.User.FullName,
                    UserAvatar = vr.User.AvatarUrl,
                    MatchId = vr.MatchId,
                    Rating = vr.Rating,
                    Comment = vr.Comment,
                    CreatedAt = vr.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllVenueRatingsAsync: ElapsedMs={ElapsedMs}, VenueId={VenueId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}",
                    elapsedMs, venueId, userId, pageNumber, pageSize, items.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllVenueRatingsAsync completed: ElapsedMs={ElapsedMs}, VenueId={VenueId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, venueId, userId, pageNumber, pageSize, items.Count, totalCount);
            }

            return new PagedResponse<VenueRatingDto>(
                Items: items,
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
                "GetAllVenueRatingsAsync error: ElapsedMs={ElapsedMs}, VenueId={VenueId}, UserId={UserId}",
                sw.ElapsedMilliseconds, venueId, userId);
            throw;
        }
    }

    public async Task<VenueRatingDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var rating = await _context.VenueRatings
                .AsNoTracking()
                .Include(vr => vr.Venue)
                .Include(vr => vr.User)
                .Where(vr => vr.Id == id)
                .Select(vr => new VenueRatingDto
                {
                    Id = vr.Id,
                    VenueId = vr.VenueId,
                    VenueName = vr.Venue.Name,
                    UserId = vr.UserId,
                    UserName = vr.User.FullName,
                    UserAvatar = vr.User.AvatarUrl,
                    MatchId = vr.MatchId,
                    Rating = vr.Rating,
                    Comment = vr.Comment,
                    CreatedAt = vr.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetVenueRatingByIdAsync: ElapsedMs={ElapsedMs}, VenueRatingId={VenueRatingId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetVenueRatingByIdAsync completed: ElapsedMs={ElapsedMs}, VenueRatingId={VenueRatingId}, Found={Found}",
                    elapsedMs, id, rating != null);
            }

            return rating;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetVenueRatingByIdAsync error: ElapsedMs={ElapsedMs}, VenueRatingId={VenueRatingId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<VenueRating?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.VenueRatings
            .FirstOrDefaultAsync(vr => vr.Id == id, cancellationToken);
    }

    public async Task<bool> HasRatedMatchAsync(Guid userId, Guid matchId, CancellationToken cancellationToken)
    {
        return await _context.VenueRatings
            .AnyAsync(vr => vr.UserId == userId && vr.MatchId == matchId, cancellationToken);
    }

    public async Task<bool> IsMatchParticipantAsync(Guid userId, Guid matchId, CancellationToken cancellationToken)
    {
        return await _context.MatchPlayers
            .AnyAsync(mp => mp.MatchId == matchId && mp.UserId == userId, cancellationToken);
    }

    public async Task<(double? Average, int Count)> GetVenueStatsAsync(Guid venueId, CancellationToken cancellationToken)
    {
        var stats = await _context.VenueRatings
            .Where(vr => vr.VenueId == venueId)
            .GroupBy(vr => vr.VenueId)
            .Select(g => new
            {
                Average = g.Average(vr => (double)vr.Rating),
                Count = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return stats == null ? (null, 0) : (Math.Round(stats.Average, 2), stats.Count);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var rating = await _context.VenueRatings
            .FirstOrDefaultAsync(vr => vr.Id == id, cancellationToken);
        if (rating != null)
        {
            _context.VenueRatings.Remove(rating);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
