using System;
using System.Diagnostics;
using System.Text.Json;
using Picadito.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
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
    IHttpContextAccessor httpContextAccessor,
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
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, BookingId: {BookingId}", 
            correlationId, request.Id))
        {
            _logger.LogInformation("Starting booking rejection. BookingId: {BookingId}", request.Id);
            
            var user = httpContextAccessor.HttpContext?.User;

            /// Validamos que el usuario esté autenticado. 
            if (user?.Identity?.IsAuthenticated != true)
            {
                _logger.LogWarning("User not authenticated");
                return Error.Unauthorized(description: "Usuario no autenticado.");
            }

            /// Extraemos el ID del usuario.
            var userIdClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                _logger.LogWarning("User ID claim not found or invalid");
                return Error.Unauthorized(description: "No se pudo identificar al usuario.");
            }

            /// Verificamos si el usuario tiene el rol de venue_owner o admin en app_metadata
            var rawAppMetadata = user.FindFirst("app_metadata")?.Value;
            if (string.IsNullOrEmpty(rawAppMetadata))
            {
                _logger.LogWarning("User app_metadata not found. UserId: {UserId}", userIdClaim);
                return Error.Forbidden(
                    "Booking.Forbidden",
                    "Acceso denegado. Solo los propietarios de complejos pueden gestionar reservas.");
            }
            
            var (isAdmin, isOwner) = GetUserRoles(rawAppMetadata);

            // Validamos que tenga un rol permitido (Admin o VenueOwner)
            if (!isAdmin && !isOwner)
            {
                _logger.LogWarning("Unauthorized role attempt. UserId: {UserId}", userIdClaim);
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
                if (booking.Pitch.Venue.OwnerId != currentUserId)
                {
                    _logger.LogWarning("Intento de rechazo no autorizado. El usuario {UserId} intentó rechazar la reserva {BookingId} pero no es el dueño del complejo.", currentUserId, booking.Id);
                    
                    return Error.Forbidden(
                        code: "Booking.NotOwner", 
                        description: "No tenés permisos para gestionar reservas de este complejo.");
                }
            }

            /// Intentamos actualizar el estado de la reserva a rechazado.
            var result = await bookingRepository.UpdateStatusAsync(
                request.Id,
                BookingStatus.rejected,
                currentUserId,
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
                    request.Id, currentUserId);
            }

            return result;
        }
    }

    /// <summary>
    /// Verifica si el usuario tiene el rol de venue_owner en app_metadata.
    /// </summary>
    /// <param name="appMetadata">JSON string del claim app_metadata.</param>
    /// <returns>True si el rol es venue_owner, false en caso contrario.</returns>
     private static (bool IsAdmin, bool IsOwner) GetUserRoles(string? appMetadata)
    {
        if (appMetadata is null)
        {
            return (false, false);
        }
        try
        {
            using var jsonDoc = JsonDocument.Parse(appMetadata);
            if (jsonDoc.RootElement.TryGetProperty("role", out var roleElement))
            {
                var role = roleElement.GetString();
                return (role == "admin", role == "venue_owner");
            }
        }
        catch
        {
            // Si el formato del JSON es inválido, asumimos que no tiene roles válidos
        }
        return (false, false);
    }
}
