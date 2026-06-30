using FluentValidation;

namespace Picadito.Application.Features.Matches.Queries.GetAllMatches;

/// <summary>
/// Validador para la query de listado de Matches.
/// </summary>
public class GetAllMatchesQueryValidator : AbstractValidator<GetAllMatchesQuery>
{
    private static readonly string[] ValidStatuses =
        ["scheduled", "played", "cancelled"];

    public GetAllMatchesQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("El número de página debe ser mayor a 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.");

        When(x => !string.IsNullOrEmpty(x.Date), () =>
        {
            RuleFor(x => x.Date!)
                .Matches(@"^\d{4}-\d{2}-\d{2}$")
                .WithMessage("La fecha debe tener el formato yyyy-MM-dd.");
        });

        When(x => !string.IsNullOrEmpty(x.Status), () =>
        {
            RuleFor(x => x.Status!)
                .Must(status => ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"El estado debe ser uno de: {string.Join(", ", ValidStatuses)}.");
        });
    }
}
