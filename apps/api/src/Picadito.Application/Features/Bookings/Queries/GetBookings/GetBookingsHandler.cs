using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Handler para procesar GetBookingsQuery.
/// </summary>
public class GetBookingsHandler(
    IBookingRepository bookingRepository,
    IValidator<GetBookingsQuery> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetBookingsHandler> logger)
{
    private readonly ILogger<GetBookingsHandler> _logger = logger;
    
    public async Task<ErrorOr<List<BookingDto>>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        var user = httpContextAccessor.HttpContext?.User;
        
        /// Verificar si usuario es autenticado
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        /// Obtener el usuario y verificar si existe
        var userIdClaim = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        var userId = Guid.Parse(userIdClaim);

        // Extraer rol desde app_metadata (formato JSON)
        var rawRoleClaim = httpContextAccessor.HttpContext?.User.FindFirst("app_metadata")?.Value;
        string? roleName = null;

        if (!string.IsNullOrEmpty(rawRoleClaim))
        {
            try
            {
                using var jsonDoc = JsonDocument.Parse(rawRoleClaim);
                if (jsonDoc.RootElement.TryGetProperty("role", out var roleElement))
                {
                    roleName = roleElement.GetString();
                }
            }
            catch
            {
                _logger.LogWarning("Invalid role format in token");
                return Error.Unauthorized(description: "El formato del rol en el token es inválido.");
            }
        }

        if (!Enum.TryParse<UserRole>(roleName, true, out var userRole))
        {
            _logger.LogWarning("Invalid role. Role: {Role}", roleName);
            return Error.Forbidden(code: "Role.Invalid", description: $"El rol '{roleName}' no es reconocido.");
        }

        _logger.LogInformation("GetBookings request started: UserId={UserId}, Role={Role}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}",
            userIdClaim, userRole, request.Status, request.PaymentStatus, request.PitchId);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetBookings validation failed: UserId={UserId}, Errors={Errors}",
                    userIdClaim, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error => 
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            var bookings = await bookingRepository.GetAllAsync(
                userId,
                userRole,
                request.Status,
                request.PaymentStatus,
                request.PitchId,
                cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetBookings: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}, Count={Count}",
                    elapsedMs, userIdClaim, userRole,request.Status, request.PaymentStatus, request.PitchId, bookings.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetBookings completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, Count={Count}",
                    elapsedMs, userIdClaim, userRole, bookings.Count);
            }

            return bookings;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetBookings error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userIdClaim, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
