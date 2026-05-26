using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using ErrorOr;
using Picadito.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// Handler para procesar CancelBookingCommand.
/// Valida la autenticación y autorización del usuario antes de cancelar la reserva.
/// </summary>
public class CancelBookingHandler(
    IBookingRepository bookingRepository,
    ICurrentUserService currentUserService,
    ILogger<CancelBookingHandler> logger)
{
    private readonly ILogger<CancelBookingHandler> _logger = logger;
    
    /// <summary>
    /// Procesa la cancelación de una reserva.
    /// Solo el owner del complejo puede cancelar reservas confirmadas.
    /// </summary>
    /// <param name="request">Comando con el ID de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success si la cancelación fue exitosa, o un Error en caso de fallo.</returns>
    public async Task<ErrorOr<Success>> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, BookingId: {BookingId}", 
            correlationId, request.Id))
        {
            _logger.LogInformation("Starting booking cancellation. BookingId: {BookingId}", request.Id);
            
            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;
            var isOwner = userRole == UserRole.venue_owner;
            var isPlayer = userRole == UserRole.player;

            /// Obtener la reserva CON la información del Venue
            var booking = await bookingRepository.GetByIdWithVenueAsync(request.Id, cancellationToken);
            if (booking is null)
            {
                _logger.LogWarning("Booking not found. BookingId: {BookingId}", request.Id);
                return Error.NotFound(description: "La reserva no existe.");
            }

            // Validacion de permisos (Siguiendo la lógica de la política RLS)
            bool hasPermission = false;

            if (isAdmin) 
                {
                    hasPermission = true; // El Admin siempre puede
                }
                else if (isOwner && booking.Pitch.Venue.OwnerId == userId)
                {
                    hasPermission = true; // El Dueño puede si es su complejo
                }
                else if (isPlayer && booking.UserId == userId && booking.Status == BookingStatus.pending)
                {
                    hasPermission = true; // El Usuario puede solo si es suya y está pendiente
                }

                if (!hasPermission)
                {
                    _logger.LogWarning("Unauthorized cancellation attempt. User: {UserId}, Role: {Role}, Booking: {BookingId}", 
                        userId, currentUserService.Role, request.Id);
                    return Error.Forbidden(description: "No tienes permisos para cancelar esta reserva en su estado actual.");
                }          
            
            var result = await bookingRepository.CancelAsync(
                request.Id,
                userId,
                isAdmin,
                cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Booking cancellation failed. BookingId: {BookingId}, ErrorCode: {ErrorCode}", 
                    request.Id, result.FirstError.Code);
            }
            else
            {
                _logger.LogInformation("Booking cancelled successfully. BookingId: {BookingId}, OwnerId: {OwnerId}", 
                    request.Id, userId);
            }

            return result;
        }
    }
}