using FluentValidation;

namespace Picadito.Application.Features.VenueClosures.Commands.CreateVenueClosure;

public class CreateVenueClosureCommandValidator : AbstractValidator<CreateVenueClosureCommand>
{
    public CreateVenueClosureCommandValidator()
    {
        RuleFor(x => x.ClosureDate)
            .NotEmpty().WithMessage("La fecha de cierre es obligatoria.")
            .Matches(@"^\d{4}-\d{2}-\d{2}$").WithMessage("El formato de la fecha debe ser yyyy-MM-dd.");

        RuleFor(x => x.StartTime)
            .Matches(@"^\d{2}:\d{2}$").When(x => x.StartTime is not null)
            .WithMessage("El formato de la hora de inicio debe ser HH:mm.");

        RuleFor(x => x.EndTime)
            .Matches(@"^\d{2}:\d{2}$").When(x => x.EndTime is not null)
            .WithMessage("El formato de la hora de fin debe ser HH:mm.");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("El motivo no puede exceder los 500 caracteres.");
    }
}
