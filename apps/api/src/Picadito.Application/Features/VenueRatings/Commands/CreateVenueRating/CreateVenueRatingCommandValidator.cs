using FluentValidation;

namespace Picadito.Application.Features.VenueRatings.Commands.CreateVenueRating;

public class CreateVenueRatingCommandValidator : AbstractValidator<CreateVenueRatingCommand>
{
    public CreateVenueRatingCommandValidator()
    {
        RuleFor(x => x.VenueId)
            .NotEmpty()
            .WithMessage("El ID del complejo es obligatorio.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5)
            .WithMessage("La calificación debe estar entre 1 y 5.");

        RuleFor(x => x.Comment)
            .MaximumLength(1000)
            .WithMessage("El comentario no puede exceder los 1000 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Comment));
    }
}
