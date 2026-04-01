using System;

namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

using FluentValidation;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.TimeSlotId)
            .NotEmpty()
            .WithMessage("El TimeSlotId es obligatorio.");
    }
}
