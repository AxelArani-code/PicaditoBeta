using FluentValidation;

namespace Picadito.Application.Features.AvailabilityRules.Queries.GetAllAvailabilityRules;

public class GetAllAvailabilityRulesQueryValidator : AbstractValidator<GetAllAvailabilityRulesQuery>
{
    public GetAllAvailabilityRulesQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("El número de página debe ser mayor a 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.");
    }
}
