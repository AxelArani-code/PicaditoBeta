using FluentValidation;

namespace Picadito.Application.Features.Profiles.Commands.DeleteProfile;

public class DeleteProfileValidator : AbstractValidator<DeleteProfileCommand>
{
    public DeleteProfileValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del perfil es obligatorio.");
    }
}
