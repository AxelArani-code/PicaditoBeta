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
/// Implementación del repositorio de TimeSlots usando EF Core.
/// Incluye seguridad a nivel de repositorio basada en roles (bypass de RLS en C#).
/// </summary>
public class TimeSlotRepository : ITimeSlotRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TimeSlotRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public TimeSlotRepository(ApplicationDbContext context, ILogger<TimeSlotRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(TimeSlot timeSlot, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        await _context.Set<TimeSlot>().AddAsync(timeSlot, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "TimeSlot creado exitosamente. SlotId: {SlotId}, PitchId: {PitchId}, Date: {Date}, StartTime: {StartTime}, IsAdmin: {IsAdmin}",
            timeSlot.Id, timeSlot.PitchId, timeSlot.Date, timeSlot.StartTime, isAdmin);

        return timeSlot.Id;
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

    public async Task<bool> HasOverlappingSlotAsync(Guid pitchId, DateOnly date, TimeSpan startTime, TimeSpan endTime, CancellationToken cancellationToken)
    {
        return await _context.Set<TimeSlot>()
            .AnyAsync(ts =>
                ts.PitchId == pitchId &&
                ts.Date == date &&
                ts.StartTime < endTime &&
                ts.EndTime > startTime &&
                ts.Status != SlotStatus.unavailable.ToString(),
                cancellationToken);
    }

    public async Task<ErrorOr<PagedResponse<TimeSlotDto>>> GetAllAsync(
        Guid? pitchId,
        DateOnly? date,
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
            var query = _context.Set<TimeSlot>()
                .AsNoTracking()
                .Include(ts => ts.Pitch)
                    .ThenInclude(p => p.Venue)
                .AsQueryable();

            // --- 🛡️ SEGURIDAD BASADA EN ROLES ---
            if (userRole == UserRole.venue_owner)
            {
                // Un dueño solo ve los turnos de sus propias canchas
                query = query.Where(ts => ts.Pitch.Venue.OwnerId == currentUserId);
            }

            // Aplicar filtros opcionales
            if (pitchId.HasValue)
            {
                query = query.Where(ts => ts.PitchId == pitchId.Value);
            }

            if (date.HasValue)
            {
                query = query.Where(ts => ts.Date == date.Value);
            }

            // Conteo total para paginación
            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;

            // Ejecutar consulta paginada con mapeo a DTO
            var slots = await query
                .OrderByDescending(ts => ts.Date)
                .ThenBy(ts => ts.StartTime)
                .ThenBy(ts => ts.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(ts => new TimeSlotDto
                {
                    Id = ts.Id,
                    PitchId = ts.PitchId,
                    PitchName = ts.Pitch.Name,
                    Date = ts.Date,
                    StartTime = ts.StartTime.ToString(@"hh\:mm"),
                    EndTime = ts.EndTime.ToString(@"hh\:mm"),
                    Price = ts.Price,
                    Status = ts.Status,
                    CreatedAt = ts.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, PitchId={PitchId}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, pitchId, slots.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completado: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, slots.Count, totalCount);
            }

            return new PagedResponse<TimeSlotDto>(
                Items: slots,
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

    public async Task<TimeSlot?> GetEntityByIdAsync(Guid slotId, CancellationToken cancellationToken)
    {
        return await _context.Set<TimeSlot>()
            .FirstOrDefaultAsync(ts => ts.Id == slotId, cancellationToken);
    }

    public async Task<ErrorOr<TimeSlotDto>> GetByIdAsync(
        Guid slotId, Guid currentUserId, UserRole userRole, CancellationToken cancellationToken)
    {
        var query = _context.Set<TimeSlot>()
            .AsNoTracking()
            .Include(ts => ts.Pitch)
                .ThenInclude(p => p.Venue)
            .Where(ts => ts.Id == slotId);

        // Aplicar filtro de seguridad para venue_owner
        if (userRole == UserRole.venue_owner)
        {
            query = query.Where(ts => ts.Pitch.Venue.OwnerId == currentUserId);
        }

        var slot = await query
            .Select(ts => new TimeSlotDto
            {
                Id = ts.Id,
                PitchId = ts.PitchId,
                PitchName = ts.Pitch.Name,
                Date = ts.Date,
                StartTime = ts.StartTime.ToString(@"hh\:mm"),
                EndTime = ts.EndTime.ToString(@"hh\:mm"),
                Price = ts.Price,
                Status = ts.Status,
                CreatedAt = ts.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (slot is null)
        {
            return userRole == UserRole.venue_owner
                ? DomainErrors.TimeSlot.Forbidden
                : DomainErrors.TimeSlot.NotFound;
        }

        return slot;
    }
}
