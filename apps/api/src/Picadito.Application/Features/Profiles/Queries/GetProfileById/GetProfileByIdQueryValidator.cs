using FluentValidation;

namespace Picadito.Application.Features.Profiles.Queries.GetProfileById;

public class GetProfileByIdQueryValidator : AbstractValidator<GetProfileByIdQuery>
{
    public GetProfileByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del perfil es obligatorio.");
    }
}
