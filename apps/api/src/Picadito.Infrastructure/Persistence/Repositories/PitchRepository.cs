using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
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
            // Construir la consulta base incluyendo la relación con Venue
            var query = _context.Pitches
                .Include(p => p.Venue)
                .AsQueryable();

            // --- APLICACIÓN DE SEGURIDAD POR ROLES (is_active) ---
            if (userRole == UserRole.admin)
            {
                // El admin ve todas las canchas (activas e inactivas) de cualquier complejo
                // Sin filtro adicional de propiedad ni de estado
            }
            else if (userRole == UserRole.venue_owner)
            {
                // El dueño ve todas las canchas (activas e inactivas) solo de sus complejos
                query = query.Where(p => p.Venue.OwnerId == currentUserId);
            }
            else
            {
                // El player solo ve canchas activas de cualquier complejo
                query = query.Where(p => p.IsActive);
            }

            // Aplicar filtros opcionales
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

            // Obtener el conteo total de registros que coinciden con los filtros y la seguridad por rol
            var totalCount = await query.CountAsync(cancellationToken);

            // Calcular el total de páginas basado en el tamaño de página
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Calcular el salto (skip) basado en la página actual
            // Fórmula: (pageNumber - 1) * pageSize
            var skip = (pageNumber - 1) * pageSize;

            // Aplicar ordenamiento determinista por fecha de creación y luego por ID
            // y aplicar paginación con Skip/Take
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

            // Construir y retornar la respuesta paginada
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
}
