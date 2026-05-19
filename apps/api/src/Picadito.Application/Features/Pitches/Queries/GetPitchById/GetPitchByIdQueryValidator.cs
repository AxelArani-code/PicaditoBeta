using FluentValidation;

namespace Picadito.Application.Features.Pitches.Queries.GetPitchById;

public class GetPitchByIdQueryValidator : AbstractValidator<GetPitchByIdQuery>
{
    public GetPitchByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la cancha es obligatorio.");
    }
}
