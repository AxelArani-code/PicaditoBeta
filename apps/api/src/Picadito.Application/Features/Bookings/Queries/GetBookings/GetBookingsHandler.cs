using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
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
        
        if (user?.Identity?.IsAuthenticated != true)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userIdClaim = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Error.Unauthorized(description: "No se pudo identificar al usuario.");
        }

        _logger.LogInformation("GetBookings request started: UserId={UserId}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}",
            userIdClaim, request.Status, request.PaymentStatus, request.PitchId);

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
                request.Status,
                request.PaymentStatus,
                request.PitchId,
                cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetBookings: ElapsedMs={ElapsedMs}, UserId={UserId}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}, Count={Count}",
                    elapsedMs, userIdClaim, request.Status, request.PaymentStatus, request.PitchId, bookings.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetBookings completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Count={Count}",
                    elapsedMs, userIdClaim, bookings.Count);
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
