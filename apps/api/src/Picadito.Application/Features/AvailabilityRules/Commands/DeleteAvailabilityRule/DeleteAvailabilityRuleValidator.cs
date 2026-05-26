using FluentValidation;

namespace Picadito.Application.Features.AvailabilityRules.Commands.DeleteAvailabilityRule;

public class DeleteAvailabilityRuleValidator : AbstractValidator<DeleteAvailabilityRuleCommand>
{
    public DeleteAvailabilityRuleValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la regla de disponibilidad es obligatorio.");
    }
}
