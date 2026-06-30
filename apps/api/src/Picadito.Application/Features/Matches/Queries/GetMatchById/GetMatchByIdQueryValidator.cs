using FluentValidation;

namespace Picadito.Application.Features.Matches.Queries.GetMatchById;

/// <summary>
/// Validador para la query de obtención de Match por ID.
/// </summary>
public class GetMatchByIdQueryValidator : AbstractValidator<GetMatchByIdQuery>
{
    public GetMatchByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del partido es obligatorio.");
    }
}
