using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

/// <summary>
/// Implementación del repositorio de reservas usando EF Core.
/// </summary>
public class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BookingRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public BookingRepository(ApplicationDbContext context, ILogger<BookingRepository> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task<ErrorOr<Guid>> AddAsync(Booking booking, Guid currentUserId, bool isAdmin, CancellationToken cancellationToken)
    {
        // Si no es admin, validar que el usuario sea el dueño de la reserva
        if (!isAdmin)
        {
            // Verificar que el user_id de la reserva coincida con el usuario actual
            if (booking.UserId != currentUserId)
            {
                // Verificar si el usuario es el dueño del Venue asociado a la cancha
                var pitchVenueOwnerId = await _context.Pitches
                    .Where(p => p.Id == booking.PitchId)
                    .Select(p => p.Venue.OwnerId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (pitchVenueOwnerId != currentUserId)
                {
                    _logger.LogWarning(
                        "Unauthorized booking creation attempt. BookingUserId: {BookingUserId}, PitchOwnerId: {PitchOwnerId}, CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}",
                        booking.UserId, pitchVenueOwnerId, currentUserId, isAdmin);
                    return Error.Unauthorized("Booking.Unauthorized", "No tienes permisos para crear esta reserva.");
                }

                _logger.LogInformation(
                    "Venue owner creating booking for their pitch. VenueOwnerId: {VenueOwnerId}, PitchId: {PitchId}",
                    currentUserId, booking.PitchId);
            }
        }
        else
        {
            _logger.LogInformation(
                "Admin [Id] creando reserva para el usuario [TargetId]. AdminId: {AdminId}, TargetUserId: {TargetUserId}",
                currentUserId, booking.UserId);
        }

        await _context.Bookings.AddAsync(booking, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Booking created successfully. BookingId: {BookingId}, TimeSlotId: {TimeSlotId}, UserId: {UserId}, IsAdmin: {IsAdmin}",
            booking.Id, booking.TimeSlotId, booking.UserId, isAdmin);

        return booking.Id;
    }

    public async Task<ErrorOr<PagedResponse<BookingDto>>> GetAllAsync(
        Guid currentUserId,
        UserRole userRole,
        string? status,
        string? paymentStatus,
        Guid? pitchId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            // Construir la consulta base con las inclusiones necesarias
            IQueryable<Booking> query = _context.Bookings
                .AsNoTracking()
                .Include(b => b.Pitch)
                    .ThenInclude(p => p.Venue)
                .Include(b => b.User);

            // --- 🛡️ APLICACIÓN DE SEGURIDAD (BYPASS DE RLS EN C#) ---
            if (userRole != UserRole.admin)
            {
                if (userRole == UserRole.venue_owner)
                {
                    // Un dueño solo ve las reservas de sus complejos
                    query = query.Where(b => b.Pitch.Venue.OwnerId == currentUserId);
                }
                else
                {
                    // Un player solo ve sus propias reservas
                    query = query.Where(b => b.UserId == currentUserId);
                }
            }

            // Aplicar filtros opcionales
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status.ToString().ToLower() == status.ToLower());
            }

            if (!string.IsNullOrEmpty(paymentStatus))
            {
                query = query.Where(b => b.PaymentStatus.ToLower() == paymentStatus.ToLower());
            }

            if (pitchId.HasValue)
            {
                query = query.Where(b => b.PitchId == pitchId.Value);
            }

            // Obtener el conteo total de registros que coinciden con los filtros y la seguridad por rol
            var totalCount = await query.CountAsync(cancellationToken);

            // Calcular el total de páginas basado en el tamaño de página
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Calcular el salto (skip) basado en la página actual
            // Fórmula: (pageNumber - 1) * pageSize
            var skip = (pageNumber - 1) * pageSize;

            // Aplicar ordenamiento determinista por fecha de creación (más recientes primero)
            // y aplicar paginación con Skip/Take
            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .ThenBy(b => b.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    TimeSlotId = b.TimeSlotId,
                    PitchId = b.PitchId,
                    PitchName = b.Pitch.Name,
                    UserId = b.UserId,
                    UserName = b.User.FullName,
                    Date = b.Date,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status.ToString().ToLower(),
                    PaymentStatus = b.PaymentStatus,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, status, paymentStatus, pitchId, bookings.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, bookings.Count, totalCount);
            }

            // Construir y retornar la respuesta paginada
            return new PagedResponse<BookingDto>(
                Items: bookings,
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
                "GetAllAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, status, paymentStatus, pitchId);
            throw;
        }
    }

    /// <summary>
    /// Actualiza el estado de una reserva.
    /// Valida que el usuario sea el propietario del complejo asociado a la reserva.
    /// </summary>
    public async Task<ErrorOr<Success>> UpdateStatusAsync(
        Guid id,
        BookingStatus newStatus,
        Guid ownerId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        // Cargamos la reserva con su Pitch y Venue para validar propiedad
        var booking = await _context.Bookings
            .Include(b => b.Pitch)
                .ThenInclude(p => p.Venue)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (booking == null)
        {
            return Error.NotFound("Booking.NotFound", "La reserva no fue encontrada.");
        }

        // Verificar que la reserva esté en estado pending (solo se pueden confirmar/rechazar reservas pendientes)
        if (booking.Status != BookingStatus.pending)
        {
            return Error.Conflict(
                "Booking.InvalidState",
                $"No se puede cambiar el estado de una reserva que ya está '{booking.Status}'.");
        }

        // Verificar que el usuario sea el propietario del Venue
        // IMPORTANTE: Esta validación es crítica para la seguridad
        if (!isAdmin && booking.Pitch.Venue.OwnerId != ownerId)
        {
            return Error.Unauthorized(
                "Booking.NotAuthorized",
                "No tienes permisos para modificar esta reserva.");
        }

        // Actualizar el estado usando el método del dominio
        // IMPORTANTE: Usamos el método UpdateStatus() que modifica la propiedad Status
        // para que EF Core detecte el cambio y envíe la columna 'status' en el UPDATE SQL
        // Esto es crítico para que se dispare el trigger 'booking_status_changed' en PostgreSQL
        booking.UpdateStatus(newStatus);

        // Marcamos la entidad como modificada para asegurar que se envíen todos los valores
        _context.Bookings.Update(booking);

        // Guardamos los cambios - EF Core generará el UPDATE SQL con la columna status
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }

    public async Task<bool> ExistsActiveBookingForSlotAsync(Guid timeSlotId, CancellationToken cancellationToken)
    {
        return await _context.Bookings
        .AnyAsync(b => b.TimeSlotId == timeSlotId && 
                  (b.Status == BookingStatus.pending || b.Status == BookingStatus.confirmed), 
                  cancellationToken);
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .Include(b => b.Pitch)
                .ThenInclude(p => p.Venue)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<ErrorOr<Success>> CancelAsync(
        Guid id,
        Guid ownerId,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .Include(b => b.Pitch)
                .ThenInclude(p => p.Venue)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (booking == null)
        {
            return DomainErrors.Booking.NotFound;
        }

         // --- REGLA DE SEGURIDAD DEL REPOSITORIO ---
        bool isTheOwner = booking.Pitch.Venue.OwnerId == ownerId;
        bool isThePlayer = booking.UserId == ownerId;

        if (!isAdmin && !isTheOwner && !isThePlayer)
        {
            return DomainErrors.Booking.Unauthorized;
        }

        if (booking.Status != BookingStatus.confirmed)
        {
            return DomainErrors.Booking.NotConfirmed;
        }

        booking.UpdateStatus(BookingStatus.cancelled);

        _context.Bookings.Update(booking);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
    public async Task<Booking?> GetByIdWithVenueAsync(Guid id, CancellationToken ct)
    {
        return await _context.Bookings
            .Include(b => b.Pitch)
                .ThenInclude(p => p.Venue)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }

}
