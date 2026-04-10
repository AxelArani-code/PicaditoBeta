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

        // Definimos los valores válidos basados en tus Enums (deben coincidir con tu Domain)
        var valoresValidosTipo = new[] { "5v5", "7v7", "11v11" };
        var valoresValidosSuperficie = new[] { "sintetico", "cesped", "parquet" };

        // Validación para Type
        RuleFor(x => x.Type)
            .Must(type => string.IsNullOrEmpty(type) || valoresValidosTipo.Contains(type))
            .WithMessage($"El tipo de cancha no es válido. Los valores permitidos son: {string.Join(", ", valoresValidosTipo)}.");

        // Validación para Surface
        RuleFor(x => x.Surface)
            .Must(surface => string.IsNullOrEmpty(surface) || valoresValidosSuperficie.Contains(surface))
            .WithMessage($"La superficie no es válida. Los valores permitidos son: {string.Join(", ", valoresValidosSuperficie)}.");

        // Validación para VenueId (opcional, pero debe ser un GUID válido si viene)
        RuleFor(x => x.VenueId)
            .NotEqual(Guid.Empty)
            .When(x => x.VenueId.HasValue)
            .WithMessage("El ID del complejo (VenueId) proporcionado no es válido.");
    }
}
