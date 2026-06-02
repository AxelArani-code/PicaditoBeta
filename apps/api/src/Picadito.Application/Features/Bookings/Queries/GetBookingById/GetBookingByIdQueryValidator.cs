using FluentValidation;

namespace Picadito.Application.Features.Bookings.Queries.GetBookingById;

public class GetBookingByIdQueryValidator : AbstractValidator<GetBookingByIdQuery>
{
    public GetBookingByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la reserva es obligatorio.");
    }
}
