using FluentValidation;
using Picadito.Application.Features.Bookings.Commands.CancelBooking;

namespace Picadito.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// Validador para CancelBookingCommand.
/// </summary>
public class CancelBookingValidator : AbstractValidator<CancelBookingCommand>
{
    public CancelBookingValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la reserva es obligatorio.");
    }
}