using FluentValidation;

namespace Picadito.Application.Features.VenueRatings.Queries.GetAllVenueRatings;

public class GetAllVenueRatingsQueryValidator : AbstractValidator<GetAllVenueRatingsQuery>
{
    public GetAllVenueRatingsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El número de página debe ser mayor o igual a 1.")
            .When(x => x.PageNumber != 0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.")
            .When(x => x.PageSize != 0);
    }
}
