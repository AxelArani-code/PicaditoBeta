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
        // En este caso, la query no tiene parámetros obligatorios
        // pero se deja la estructura para extensiones futuras
        RuleFor(x => x)
            .NotEmpty()
            .WithMessage("La consulta no puede estar vacía.");
    }
}
