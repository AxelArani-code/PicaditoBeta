using FluentValidation;

namespace Picadito.Application.Features.VenueClosures.Queries.GetAllVenueClosures;

public class GetAllVenueClosuresQueryValidator : AbstractValidator<GetAllVenueClosuresQuery>
{
    public GetAllVenueClosuresQueryValidator()
    {
        RuleFor(x => x.FromDate)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").When(x => x.FromDate is not null)
            .WithMessage("El formato de 'Desde' debe ser yyyy-MM-dd.");

        RuleFor(x => x.ToDate)
            .Matches(@"^\d{4}-\d{2}-\d{2}$").When(x => x.ToDate is not null)
            .WithMessage("El formato de 'Hasta' debe ser yyyy-MM-dd.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("El número de página debe ser mayor o igual a 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("El tamaño de página debe estar entre 1 y 100.");
    }
}
