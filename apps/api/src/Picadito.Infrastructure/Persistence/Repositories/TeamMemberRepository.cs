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

/// <summary>
/// Implementación del repositorio de miembros de equipo usando EF Core.
/// </summary>
public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TeamMemberRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public TeamMemberRepository(ApplicationDbContext context, ILogger<TeamMemberRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(TeamMember member, CancellationToken cancellationToken)
    {
        await _context.TeamMembers.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "TeamMember created. TeamMemberId: {TeamMemberId}, TeamId: {TeamId}, UserId: {UserId}, Role: {Role}",
            member.Id, member.TeamId, member.UserId, member.Role);

        return member.Id;
    }

    public async Task<ErrorOr<PagedResponse<TeamMemberDto>>> GetAllAsync(
        Guid? teamId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            IQueryable<TeamMember> query = _context.TeamMembers
                .AsNoTracking()
                .Include(tm => tm.Team)
                .Include(tm => tm.User);

            if (teamId.HasValue)
            {
                query = query.Where(tm => tm.TeamId == teamId.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(tm => tm.UserId == userId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;

            var items = await query
                .OrderByDescending(tm => tm.JoinedAt)
                .ThenBy(tm => tm.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(tm => new TeamMemberDto
                {
                    Id = tm.Id,
                    TeamId = tm.TeamId,
                    TeamName = tm.Team.Name,
                    UserId = tm.UserId,
                    UserName = tm.User.FullName,
                    UserAvatar = tm.User.AvatarUrl,
                    Role = tm.Role,
                    JoinedAt = tm.JoinedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllTeamMembersAsync: ElapsedMs={ElapsedMs}, TeamId={TeamId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}",
                    elapsedMs, teamId, userId, pageNumber, pageSize, items.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllTeamMembersAsync completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, items.Count, totalCount);
            }

            return new PagedResponse<TeamMemberDto>(
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
                "GetAllTeamMembersAsync error: ElapsedMs={ElapsedMs}, TeamId={TeamId}, UserId={UserId}",
                sw.ElapsedMilliseconds, teamId, userId);
            throw;
        }
    }

    public async Task<TeamMemberDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var member = await _context.TeamMembers
                .AsNoTracking()
                .Include(tm => tm.Team)
                .Include(tm => tm.User)
                .Where(tm => tm.Id == id)
                .Select(tm => new TeamMemberDto
                {
                    Id = tm.Id,
                    TeamId = tm.TeamId,
                    TeamName = tm.Team.Name,
                    UserId = tm.UserId,
                    UserName = tm.User.FullName,
                    UserAvatar = tm.User.AvatarUrl,
                    Role = tm.Role,
                    JoinedAt = tm.JoinedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetTeamMemberByIdAsync: ElapsedMs={ElapsedMs}, TeamMemberId={TeamMemberId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetTeamMemberByIdAsync completed: ElapsedMs={ElapsedMs}, TeamMemberId={TeamMemberId}, Found={Found}",
                    elapsedMs, id, member != null);
            }

            return member;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetTeamMemberByIdAsync error: ElapsedMs={ElapsedMs}, TeamMemberId={TeamMemberId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<TeamMember?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.Id == id, cancellationToken);
    }

    public async Task<bool> IsMemberAsync(Guid teamId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.TeamMembers
            .AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId, cancellationToken);
    }

    public async Task<ErrorOr<Success>> UpdateAsync(TeamMember member, CancellationToken cancellationToken)
    {
        _context.TeamMembers.Update(member);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "TeamMember updated. TeamMemberId: {TeamMemberId}, Role: {Role}",
            member.Id, member.Role);

        return Result.Success;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var member = await _context.TeamMembers.FirstOrDefaultAsync(tm => tm.Id == id, cancellationToken);
        if (member != null)
        {
            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
