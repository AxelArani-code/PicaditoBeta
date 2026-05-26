using FluentValidation;

namespace Picadito.Application.Features.AvailabilityRules.Queries.GetAvailabilityRuleById;

public class GetAvailabilityRuleByIdQueryValidator : AbstractValidator<GetAvailabilityRuleByIdQuery>
{
    public GetAvailabilityRuleByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la regla de disponibilidad es obligatorio.");
    }
}
