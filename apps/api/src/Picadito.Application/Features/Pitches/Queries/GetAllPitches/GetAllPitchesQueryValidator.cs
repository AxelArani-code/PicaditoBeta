using FluentValidation;

namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Validador para GetAllPitchesQuery.
/// Valida los parámetros de la query de listar canchas.
/// </summary>
public class GetAllPitchesQueryValidator : AbstractValidator<GetAllPitchesQuery>
{
    public GetAllPitchesQueryValidator()
    {
        var valoresValidosTipo = new[] { "5v5", "7v7", "11v11" };
        var valoresValidosSuperficie = new[] { "sintetico", "cesped", "parquet" };

        RuleFor(x => x.Type)
            .Must(type => string.IsNullOrEmpty(type) || valoresValidosTipo.Contains(type))
            .WithMessage($"El tipo de cancha no es válido. Los valores permitidos son: {string.Join(", ", valoresValidosTipo)}.");

        RuleFor(x => x.Surface)
            .Must(surface => string.IsNullOrEmpty(surface) || valoresValidosSuperficie.Contains(surface))
            .WithMessage($"La superficie no es válida. Los valores permitidos son: {string.Join(", ", valoresValidosSuperficie)}.");

        RuleFor(x => x.VenueId)
            .NotEqual(Guid.Empty)
            .When(x => x.VenueId.HasValue)
            .WithMessage("El ID del complejo (VenueId) proporcionado no es válido.");

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
