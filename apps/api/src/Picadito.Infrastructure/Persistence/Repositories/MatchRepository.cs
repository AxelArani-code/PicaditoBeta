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

/// <summary>
/// Implementación del repositorio de Matches usando EF Core.
/// Incluye seguridad a nivel de repositorio basada en roles (bypass de RLS en C#).
/// </summary>
public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MatchRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public MatchRepository(ApplicationDbContext context, ILogger<MatchRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(Match match, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        await _context.Set<Match>().AddAsync(match, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Match creado exitosamente. MatchId: {MatchId}, BookingId: {BookingId}, VenueId: {VenueId}, IsAdmin: {IsAdmin}",
            match.Id, match.BookingId, match.VenueId, isAdmin);

        return match.Id;
    }

    public async Task<bool> IsVenueOwnerAsync(Guid venueId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Venues
            .AnyAsync(v => v.Id == venueId && v.OwnerId == userId && v.DeletedAt == null, cancellationToken);
    }

    public async Task<bool> BookingExistsAndIsConfirmedAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .AnyAsync(b => b.Id == bookingId && b.Status == BookingStatus.confirmed, cancellationToken);
    }

    public async Task<bool> BookingAlreadyHasMatchAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        return await _context.Set<Match>()
            .AnyAsync(m => m.BookingId == bookingId, cancellationToken);
    }

    public async Task<ErrorOr<PagedResponse<MatchDto>>> GetAllAsync(
        Guid? venueId,
        DateOnly? date,
        string? status,
        Guid currentUserId,
        UserRole userRole,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            // Construir la consulta base con las inclusiones necesarias
            var query = _context.Set<Match>()
                .AsNoTracking()
                .Include(m => m.Venue)
                .AsQueryable();

            // --- SEGURIDAD BASADA EN ROLES ---
            if (userRole == UserRole.venue_owner)
            {
                // Un dueño solo ve los partidos de sus propios complejos
                query = query.Where(m => m.Venue.OwnerId == currentUserId);
            }
            else if (userRole == UserRole.player)
            {
                // Un jugador solo ve partidos donde participa o de complejos activos
                query = query.Where(m =>
                    m.MatchPlayers.Any(mp => mp.UserId == currentUserId));
            }

            // Aplicar filtros opcionales
            if (venueId.HasValue)
            {
                query = query.Where(m => m.VenueId == venueId.Value);
            }

            if (date.HasValue)
            {
                query = query.Where(m => m.Date == date.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.Status.ToString().ToLower() == status.ToLower());
            }

            // Conteo total para paginación
            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;

            // Ejecutar consulta paginada con mapeo a DTO
            var matches = await query
                .OrderByDescending(m => m.Date)
                .ThenBy(m => m.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(m => new MatchDto
                {
                    Id = m.Id,
                    BookingId = m.BookingId,
                    VenueId = m.VenueId,
                    VenueName = m.Venue.Name,
                    Date = m.Date,
                    Status = m.Status.ToString(),
                    HomeScore = m.HomeScore,
                    AwayScore = m.AwayScore,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, VenueId={VenueId}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, venueId, matches.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completado: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, matches.Count, totalCount);
            }

            return new PagedResponse<MatchDto>(
                Items: matches,
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
                "GetAllAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, VenueId={VenueId}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, venueId);
            throw;
        }
    }

    public async Task<Match?> GetEntityByIdAsync(Guid matchId, CancellationToken cancellationToken)
    {
        return await _context.Set<Match>()
            .Include(m => m.Venue)
            .Include(m => m.Booking)
            .Include(m => m.MatchPlayers)
            .FirstOrDefaultAsync(m => m.Id == matchId, cancellationToken);
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Match match, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        _context.Set<Match>().Update(match);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Match actualizado exitosamente. MatchId: {MatchId}, BookingId: {BookingId}, IsAdmin: {IsAdmin}",
            match.Id, match.BookingId, isAdmin);

        return Result.Success;
    }

    public async Task<ErrorOr<MatchDto>> GetByIdAsync(
        Guid matchId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken)
    {
        var query = _context.Set<Match>()
            .AsNoTracking()
            .Include(m => m.Venue)
            .Where(m => m.Id == matchId);

        // Aplicar filtro de seguridad según el rol
        if (userRole == UserRole.venue_owner)
        {
            query = query.Where(m => m.Venue.OwnerId == currentUserId);
        }
        else if (userRole == UserRole.player)
        {
            query = query.Where(m =>
                m.MatchPlayers.Any(mp => mp.UserId == currentUserId));
        }

        var match = await query
            .Select(m => new MatchDto
            {
                Id = m.Id,
                BookingId = m.BookingId,
                VenueId = m.VenueId,
                VenueName = m.Venue.Name,
                Date = m.Date,
                Status = m.Status.ToString(),
                HomeScore = m.HomeScore,
                AwayScore = m.AwayScore,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (match is null)
        {
            return userRole == UserRole.venue_owner || userRole == UserRole.player
                ? DomainErrors.Match.Forbidden
                : DomainErrors.Match.NotFound;
        }

        return match;
    }
}
