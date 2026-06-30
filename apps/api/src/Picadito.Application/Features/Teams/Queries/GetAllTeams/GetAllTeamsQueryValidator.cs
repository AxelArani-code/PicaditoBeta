using FluentValidation;

namespace Picadito.Application.Features.Teams.Queries.GetAllTeams;

/// <summary>
/// Validador para la query de obtener todos los equipos.
/// </summary>
public class GetAllTeamsQueryValidator : AbstractValidator<GetAllTeamsQuery>
{
    public GetAllTeamsQueryValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("El filtro de nombre no puede exceder los 200 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Name));

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
