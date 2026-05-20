using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProfileRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public ProfileRepository(ApplicationDbContext context, ILogger<ProfileRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Profile?> GetByIdAsync(Guid profileId, CancellationToken cancellationToken)
    {
        return await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken);
    }

    public async Task<ErrorOr<ProfileDto>> GetMyProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await _context.Profiles
            .Where(p => p.Id == userId)
            .Select(p => new ProfileDto
            {
                Id = p.Id,
                Username = p.Username,
                FullName = p.FullName,
                AvatarUrl = p.AvatarUrl,
                Role = p.Role,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return DomainErrors.Profile.NotFound;
        }

        return profile;
    }

    public async Task<ErrorOr<ProfileDto>> GetProfileByIdAsync(Guid profileId, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        var profile = await _context.Profiles
            .Where(p => p.Id == profileId)
            .Select(p => new ProfileDto
            {
                Id = p.Id,
                Username = p.Username,
                FullName = p.FullName,
                AvatarUrl = p.AvatarUrl,
                Role = p.Role,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return DomainErrors.Profile.NotFound;
        }

        return profile;
    }

    public async Task<ErrorOr<PagedResponse<ProfileDto>>> GetAllAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var query = _context.Profiles.AsQueryable();

            var totalCount = await query.CountAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var skip = (pageNumber - 1) * pageSize;

            var profiles = await query
                .OrderByDescending(p => p.CreatedAt)
                .ThenBy(p => p.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(p => new ProfileDto
                {
                    Id = p.Id,
                    Username = p.Username,
                    FullName = p.FullName,
                    AvatarUrl = p.AvatarUrl,
                    Role = p.Role,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllProfilesAsync: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, profiles.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllProfilesAsync completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, profiles.Count, totalCount);
            }

            return new PagedResponse<ProfileDto>(
                Items: profiles,
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
                "GetAllProfilesAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}",
                sw.ElapsedMilliseconds, pageNumber, pageSize);
            throw;
        }
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Profile profile, CancellationToken cancellationToken)
    {
        _context.Profiles.Update(profile);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Profile updated successfully. ProfileId: {ProfileId}",
            profile.Id);

        return Result.Success;
    }

    public async Task<bool> IsUsernameTakenAsync(string username, Guid excludeProfileId, CancellationToken cancellationToken)
    {
        return await _context.Profiles
            .AnyAsync(p => p.Username == username && p.Id != excludeProfileId, cancellationToken);
    }

    public async Task<ErrorOr<Success>> DeleteAsync(Guid profileId, CancellationToken cancellationToken)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken);

        if (profile is null)
        {
            return DomainErrors.Profile.NotFound;
        }

        var hasActiveBookings = await _context.Bookings
            .AnyAsync(b => b.UserId == profileId && (b.Status == Domain.Enums.BookingStatus.pending || b.Status == Domain.Enums.BookingStatus.confirmed), cancellationToken);

        if (hasActiveBookings)
        {
            _logger.LogWarning(
                "Cannot delete profile with active bookings. ProfileId: {ProfileId}",
                profileId);
            return DomainErrors.Profile.CannotDelete;
        }

        _context.Profiles.Remove(profile);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Profile deleted successfully. ProfileId: {ProfileId}",
            profileId);

        return Result.Success;
    }
}
