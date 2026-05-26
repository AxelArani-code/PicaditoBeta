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

public class AvailabilityRuleRepository : IAvailabilityRuleRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AvailabilityRuleRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public AvailabilityRuleRepository(ApplicationDbContext context, ILogger<AvailabilityRuleRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(AvailabilityRule rule, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        await _context.Set<AvailabilityRule>().AddAsync(rule, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Availability rule created successfully. RuleId: {RuleId}, PitchId: {PitchId}, IsAdmin: {IsAdmin}",
            rule.Id, rule.PitchId, isAdmin);

        return rule.Id;
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

    public async Task<bool> IsOwnerAsync(Guid ruleId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Set<AvailabilityRule>()
            .AnyAsync(ar => ar.Id == ruleId && ar.Pitch.Venue.OwnerId == userId, cancellationToken);
    }

    public async Task<ErrorOr<PagedResponse<AvailabilityRuleDto>>> GetAllAsync(
        Guid? pitchId,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var query = _context.Set<AvailabilityRule>()
                .Include(ar => ar.Pitch)
                .ThenInclude(p => p.Venue)
                .AsQueryable();

            if (userRole == UserRole.venue_owner)
            {
                query = query.Where(ar => ar.Pitch.Venue.OwnerId == currentUserId);
            }

            if (pitchId.HasValue)
            {
                query = query.Where(ar => ar.PitchId == pitchId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var skip = (pageNumber - 1) * pageSize;

            var rules = await query
                .OrderByDescending(ar => ar.CreatedAt)
                .ThenBy(ar => ar.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(ar => new AvailabilityRuleDto
                {
                    Id = ar.Id,
                    PitchId = ar.PitchId,
                    PitchName = ar.Pitch.Name,
                    VenueName = ar.Pitch.Venue.Name,
                    DayOfWeek = ar.DayOfWeek.ToString(),
                    StartTime = ar.StartTime.ToString(@"hh\:mm"),
                    EndTime = ar.EndTime.ToString(@"hh\:mm"),
                    PriceOverride = ar.PriceOverride,
                    CreatedAt = ar.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, PitchId={PitchId}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, pitchId, rules.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, rules.Count, totalCount);
            }

            return new PagedResponse<AvailabilityRuleDto>(
                Items: rules,
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

    public async Task<AvailabilityRule?> GetEntityByIdAsync(Guid ruleId, CancellationToken cancellationToken)
    {
        return await _context.Set<AvailabilityRule>()
            .FirstOrDefaultAsync(ar => ar.Id == ruleId, cancellationToken);
    }

    public async Task<ErrorOr<AvailabilityRuleDto>> GetByIdAsync(
        Guid ruleId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken)
    {
        var query = _context.Set<AvailabilityRule>()
            .Include(ar => ar.Pitch)
            .ThenInclude(p => p.Venue)
            .Where(ar => ar.Id == ruleId);

        if (userRole == UserRole.venue_owner)
        {
            query = query.Where(ar => ar.Pitch.Venue.OwnerId == currentUserId);
        }
        var rule = await query
            .Select(ar => new AvailabilityRuleDto
            {
                Id = ar.Id,
                PitchId = ar.PitchId,
                PitchName = ar.Pitch.Name,
                VenueName = ar.Pitch.Venue.Name,
                DayOfWeek = ar.DayOfWeek.ToString(),
                StartTime = ar.StartTime.ToString(@"hh\:mm"),
                EndTime = ar.EndTime.ToString(@"hh\:mm"),
                PriceOverride = ar.PriceOverride,
                CreatedAt = ar.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (rule is null)
        {
            return userRole == UserRole.venue_owner
                ? DomainErrors.AvailabilityRule.Forbidden
                : DomainErrors.AvailabilityRule.NotFound;
        }

        return rule;
    }

    public async Task<ErrorOr<Success>> UpdateAsync(AvailabilityRule rule, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        _context.Set<AvailabilityRule>().Update(rule);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Availability rule updated successfully. RuleId: {RuleId}, PitchId: {PitchId}, IsAdmin: {IsAdmin}",
            rule.Id, rule.PitchId, isAdmin);

        return Result.Success;
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid ruleId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        var rule = await _context.Set<AvailabilityRule>()
            .FirstOrDefaultAsync(ar => ar.Id == ruleId, cancellationToken);

        if (rule is null)
        {
            return DomainErrors.AvailabilityRule.NotFound;
        }

        _context.Set<AvailabilityRule>().Remove(rule);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Availability rule deleted successfully. RuleId: {RuleId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
            ruleId, currentUserId, isAdmin);

        return Result.Success;
    }
}
