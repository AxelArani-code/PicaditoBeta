using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Bookings.Queries.GetBookingById;

public class GetBookingByIdHandler(
    IBookingRepository bookingRepository,
    IValidator<GetBookingByIdQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetBookingByIdHandler> logger)
{
    public async Task<ErrorOr<BookingDto>> Handle(GetBookingByIdQuery request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId is null)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        var booking = await bookingRepository.GetByIdAsync(request.Id, cancellationToken);
        if (booking is null)
        {
            return Error.NotFound("Booking.NotFound", "La reserva no fue encontrada.");
        }

        logger.LogInformation(
            "GetBookingById completed: BookingId={BookingId}, UserId={UserId}",
            request.Id, currentUserService.UserId.Value);

        return new BookingDto
        {
            Id = booking.Id,
            TimeSlotId = booking.TimeSlotId,
            PitchId = booking.PitchId,
            PitchName = booking.Pitch.Name,
            UserId = booking.UserId,
            UserName = booking.User.FullName,
            Date = booking.Date,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString().ToLower(),
            PaymentStatus = booking.PaymentStatus,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt
        };
    }
}
