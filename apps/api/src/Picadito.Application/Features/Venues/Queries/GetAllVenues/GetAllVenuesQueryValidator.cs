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

        // Validar que el número de página sea mayor o igual a 1
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El número de página debe ser mayor o igual a 1.")
            .When(x => x.PageNumber != 0);

        // Validar que el tamaño de página esté entre 1 y 100
        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.")
            .When(x => x.PageSize != 0);
    }
}