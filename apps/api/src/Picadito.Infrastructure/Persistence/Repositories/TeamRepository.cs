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
/// Implementación del repositorio de equipos usando EF Core.
/// </summary>
public class TeamRepository : ITeamRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TeamRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public TeamRepository(ApplicationDbContext context, ILogger<TeamRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(Team team, CancellationToken cancellationToken)
    {
        await _context.Teams.AddAsync(team, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Team created successfully. TeamId: {TeamId}, CaptainId: {CaptainId}",
            team.Id, team.CaptainId);

        return team.Id;
    }

    public async Task<ErrorOr<PagedResponse<TeamDto>>> GetAllAsync(
        string? name,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            // Consulta base con navegación al capitán
            IQueryable<Team> query = _context.Teams
                .AsNoTracking()
                .Include(t => t.Captain);

            // Aplicar filtro opcional por nombre
            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(t => t.Name.ToLower().Contains(name.ToLower()));
            }

            // Obtener el conteo total de registros que coinciden con los filtros
            var totalCount = await query.CountAsync(cancellationToken);

            // Calcular el total de páginas
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Calcular el salto basado en la página actual
            var skip = (pageNumber - 1) * pageSize;

            // Proyección optimizada directamente en la consulta SQL
            var teams = await query
                .OrderByDescending(t => t.CreatedAt)
                .ThenBy(t => t.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(t => new TeamDto
                {
                    Id = t.Id,
                    CaptainId = t.CaptainId,
                    CaptainName = t.Captain.FullName,
                    Name = t.Name,
                    Slug = t.Slug,
                    LogoUrl = t.LogoUrl,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllTeamsAsync: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Name={Name}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, name, teams.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllTeamsAsync completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, teams.Count, totalCount);
            }

            return new PagedResponse<TeamDto>(
                Items: teams,
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
                "GetAllTeamsAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Name={Name}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, name);
            throw;
        }
    }

    public async Task<TeamDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var team = await _context.Teams
                .AsNoTracking()
                .Include(t => t.Captain)
                .Where(t => t.Id == id)
                .Select(t => new TeamDto
                {
                    Id = t.Id,
                    CaptainId = t.CaptainId,
                    CaptainName = t.Captain.FullName,
                    Name = t.Name,
                    Slug = t.Slug,
                    LogoUrl = t.LogoUrl,
                    CreatedAt = t.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetTeamByIdAsync: ElapsedMs={ElapsedMs}, TeamId={TeamId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetTeamByIdAsync completed: ElapsedMs={ElapsedMs}, TeamId={TeamId}, Found={Found}",
                    elapsedMs, id, team != null);
            }

            return team;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetTeamByIdAsync error: ElapsedMs={ElapsedMs}, TeamId={TeamId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<Team?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken)
    {
        return await _context.Teams
            .AnyAsync(t => t.Name.ToLower() == name.ToLower() && t.DeletedAt == null, cancellationToken);
    }

    public async Task<bool> IsCaptainAsync(Guid teamId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Teams
            .AnyAsync(t => t.Id == teamId && t.CaptainId == userId && t.DeletedAt == null, cancellationToken);
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Team team, CancellationToken cancellationToken)
    {
        _context.Teams.Update(team);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Team updated successfully. TeamId: {TeamId}, CaptainId: {CaptainId}",
            team.Id, team.CaptainId);

        return Result.Success;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (team != null)
        {
            team.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
