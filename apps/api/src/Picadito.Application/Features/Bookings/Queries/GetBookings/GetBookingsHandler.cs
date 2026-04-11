using System;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using ErrorOr;

namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Handler para procesar GetBookingsQuery.
/// </summary>
public class GetBookingsHandler(
    IBookingRepository bookingRepository,
    IValidator<GetBookingsQuery> validator,
    IHttpContextAccessor httpContextAccessor)
{
    public async Task<ErrorOr<List<BookingDto>>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.Errors.ConvertAll(error => 
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

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

        var bookings = await bookingRepository.GetAllAsync(
            request.Status,
            request.PaymentStatus,
            request.PitchId,
            cancellationToken);

        return bookings;
    }
}
