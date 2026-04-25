using FluentValidation;

namespace Picadito.Application.Features.Venues.Queries.GetAllVenues;

/// <summary>
/// Validador para la query de obtener todos los complejos deportivos.
/// </summary>
public class GetAllVenuesQueryValidator : AbstractValidator<GetAllVenuesQuery>
{
    public GetAllVenuesQueryValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("El filtro de nombre no puede exceder los 200 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("El filtro de dirección no puede exceder los 500 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Address));
    }
}