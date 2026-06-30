using FluentValidation;

namespace Picadito.Application.Features.Matches.Commands.CreateMatch;

/// <summary>
/// Validador para el comando de creación de Match.
/// </summary>
public class CreateMatchValidator : AbstractValidator<CreateMatchCommand>
{
    public CreateMatchValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty()
            .WithMessage("El ID de la reserva es obligatorio.");

        RuleFor(x => x.VenueId)
            .NotEmpty()
            .WithMessage("El ID del complejo deportivo es obligatorio.");

        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.")
            .Matches(@"^\d{4}-\d{2}-\d{2}$")
            .WithMessage("La fecha debe tener el formato yyyy-MM-dd.");
    }
}
