using System;
using System.Diagnostics;
using System.Text.Json;
using Picadito.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
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
    IHttpContextAccessor httpContextAccessor,
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
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, BookingId: {BookingId}", 
            correlationId, request.Id))
        {
            _logger.LogInformation("Starting booking confirmation. BookingId: {BookingId}", request.Id);
            
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

            /// Obtener la reserva CON la información del Venue
            var booking = await bookingRepository.GetByIdWithVenueAsync(request.Id, cancellationToken);
            if (booking is null)
            {
                _logger.LogWarning("Booking not found. BookingId: {BookingId}", request.Id);
                return Error.NotFound(description: "La reserva no existe.");
            }
            /// Verificamos si el OwnerId del complejo coincide con el UserId del token
            if (booking.Pitch.Venue.OwnerId != currentUserId)
            {
                _logger.LogWarning("Intento de confirmacion no autorizado. El usuario {UserId} intentó confirmar la reserva {BookingId} pero no es el dueño del complejo.", currentUserId, booking.Id);
                
                return Error.Forbidden(
                    code: "Booking.NotOwner", 
                    description: "No tenés permisos para gestionar reservas de este complejo.");
            }

            /// Verificamos si el usuario tiene el rol de venue_owner en app_metadata
            var rawAppMetadata = user.FindFirst("app_metadata")?.Value;
            
            if (string.IsNullOrEmpty(rawAppMetadata) || !IsVenueOwner(rawAppMetadata))
            {
                _logger.LogWarning("User is not a venue owner. UserId: {UserId}", userIdClaim);
                return Error.Forbidden(
                    "Booking.Forbidden",
                    "Acceso denegado. Solo los propietarios de complejos pueden gestionar reservas.");
            }

            var result = await bookingRepository.UpdateStatusAsync(
                request.Id,
                BookingStatus.confirmed,
                currentUserId,
                cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Booking confirmation failed. BookingId: {BookingId}, ErrorCode: {ErrorCode}", 
                    request.Id, result.FirstError.Code);
            }
            else
            {
                _logger.LogInformation("Booking confirmed successfully. BookingId: {BookingId}, OwnerId: {OwnerId}", 
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
    private static bool IsVenueOwner(string appMetadata)
    {
        try
        {
            using var jsonDoc = JsonDocument.Parse(appMetadata);
            if (jsonDoc.RootElement.TryGetProperty("role", out var roleElement))
            {
                var role = roleElement.GetString();
                return role == "venue_owner";
            }
        }
        catch
        {
        }
        return false;
    }
}
