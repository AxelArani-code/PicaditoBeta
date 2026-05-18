using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using ErrorOr;
using Picadito.Domain.Enums;
using Picadito.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Bookings.Commands.ConfirmBooking;

/// <summary>
/// Handler para procesar ConfirmBookingCommand.
/// Valida la autenticación y autorización del usuario antes de confirmar la reserva.
/// </summary>
public class ConfirmBookingHandler(
    IBookingRepository bookingRepository,
    ICurrentUserService currentUserService,
    ILogger<ConfirmBookingHandler> logger)
{
    private readonly ILogger<ConfirmBookingHandler> _logger = logger;
    
    /// <summary>
    /// Procesa la confirmación de una reserva.
    /// </summary>
    /// <param name="request">Comando con el ID de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success si la confirmación fue exitosa, o un Error en caso de fallo.</returns>
    public async Task<ErrorOr<Success>> Handle(ConfirmBookingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, BookingId: {BookingId}", 
            correlationId, request.Id))
        {
            _logger.LogInformation("Starting booking confirmation. BookingId: {BookingId}", request.Id);
            
            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
            {
                _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;
            var isOwner = userRole == UserRole.venue_owner;

            // Validamos que tenga un rol permitido (Admin o VenueOwner)
            if (!isAdmin && !isOwner)
            {
                _logger.LogWarning("Unauthorized role attempt. UserId: {UserId}", userId);
                return Error.Forbidden(description: "No tienes el rol correspondiente para confirmar reservas.");
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
                    _logger.LogWarning("Intento de confirmacion no autorizado. El usuario {UserId} intentó confirmar la reserva {BookingId} pero no es el dueño del complejo.", userId, booking.Id);
                    
                    return Error.Forbidden(
                        code: "Booking.NotOwner", 
                        description: "No tenés permisos para gestionar reservas de este complejo.");
                }
            }
            var result = await bookingRepository.UpdateStatusAsync(
                request.Id,
                BookingStatus.confirmed,
                userId,
                isAdmin,
                cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Booking confirmation failed. BookingId: {BookingId}, OwnerId: {OwnerId}, ErrorCode: {ErrorCode}", 
                    request.Id, userId, result.FirstError.Code);
            }
            else
            {
                _logger.LogInformation("Booking confirmed successfully. BookingId: {BookingId}, OwnerId: {OwnerId}", 
                    request.Id, userId);
            }

            return result;
        }
    }
}
