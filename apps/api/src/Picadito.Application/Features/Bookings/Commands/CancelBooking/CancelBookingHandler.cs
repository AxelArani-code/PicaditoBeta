using System;
using System.Text.Json;
using Picadito.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// Handler para procesar CancelBookingCommand.
/// Valida la autenticación y autorización del usuario antes de cancelar la reserva.
/// </summary>
public class CancelBookingHandler(
    IBookingRepository bookingRepository,
    IHttpContextAccessor httpContextAccessor)
{
    /// <summary>
    /// Procesa la cancelación de una reserva.
    /// Solo el owner del complejo puede cancelar reservas confirmadas.
    /// </summary>
    /// <param name="request">Comando con el ID de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Success si la cancelación fue exitosa, o un Error en caso de fallo.</returns>
    public async Task<ErrorOr<Success>> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var user = httpContextAccessor.HttpContext?.User;
        
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userIdClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var ownerId))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        var rawAppMetadata = user.FindFirst("app_metadata")?.Value;
        
        if (string.IsNullOrEmpty(rawAppMetadata) || !IsVenueOwner(rawAppMetadata))
        {
            return Error.Forbidden(
                "Booking.Forbidden",
                "Acceso denegado. Solo los propietarios de complejos pueden cancelar reservas.");
        }

        var result = await bookingRepository.CancelAsync(
            request.Id,
            ownerId,
            cancellationToken);

        return result;
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