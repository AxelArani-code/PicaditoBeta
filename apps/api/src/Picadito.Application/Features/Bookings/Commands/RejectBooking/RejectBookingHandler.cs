using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using ErrorOr;
using Picadito.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Bookings.Commands.RejectBooking;

/// <summary>
/// Handler para procesar RejectBookingCommand.
/// Valida la autenticación y autorización del usuario antes de rechazar la reserva.
/// </summary>
public class RejectBookingHandler(
    IBookingRepository bookingRepository,
    ICurrentUserService currentUserService,
    ILogger<RejectBookingHandler> logger)
{
    private readonly ILogger<RejectBookingHandler> _logger = logger;
    
    /// <summary>
    /// Procesa el rechazo de una reserva.
    /// </summary>
    /// <param name="request">Comando con el ID de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success si el rechazo fue exitoso, o un Error en caso de fallo.</returns>
    public async Task<ErrorOr<Success>> Handle(RejectBookingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, BookingId: {BookingId}", 
            correlationId, request.Id))
        {
            _logger.LogInformation("Starting booking rejection. BookingId: {BookingId}", request.Id);
            
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

            // Validamos que tenga un rol permitido (Admin o VenueOwner)
            if (!isAdmin && !isOwner)
            {
                _logger.LogWarning("Unauthorized role attempt. UserId: {UserId}", userId);
                return Error.Forbidden(description: "No tienes el rol correspondiente para rechazar reservas.");
            }
            
            /// Obtener la reserva CON la información del Venue
            var booking = await bookingRepository.GetByIdWithVenueAsync(request.Id, cancellationToken);
            if (booking is null)
            {
                _logger.LogWarning("Booking not found. BookingId: {BookingId}", request.Id);
                return Error.NotFound(description: "La reserva no existe.");
            }

            /// Verificamos si el OwnerId del complejo coincide con el UserId del token, a menos que el usuario sea admin (que puede gestionar todas las reservas)  
            if (!isAdmin) 
            {        
                if (booking.Pitch.Venue.OwnerId != userId)
                {
                    _logger.LogWarning("Intento de rechazo no autorizado. El usuario {UserId} intentó rechazar la reserva {BookingId} pero no es el dueño del complejo.", userId, booking.Id);
                    
                    return Error.Forbidden(
                        code: "Booking.NotOwner", 
                        description: "No tenés permisos para gestionar reservas de este complejo.");
                }
            }

            /// Intentamos actualizar el estado de la reserva a rechazado.
            var result = await bookingRepository.UpdateStatusAsync(
                request.Id,
                BookingStatus.rejected,
                userId,
                isAdmin,
                cancellationToken);
            
            /// Manejo de errores y logging detallado.

            if (result.IsError)
            {
                _logger.LogWarning("Booking rejection failed. BookingId: {BookingId}, ErrorCode: {ErrorCode}", 
                    request.Id, result.FirstError.Code);
            }
            else
            {
                _logger.LogInformation("Booking rejected successfully. BookingId: {BookingId}, OwnerId: {OwnerId}", 
                    request.Id, userId);
            }

            return result;
        }
    }
}
