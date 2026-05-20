using FluentValidation;

namespace Picadito.Application.Features.Pitches.Commands.DeletePitch;

public class DeletePitchValidator : AbstractValidator<DeletePitchCommand>
{
    public DeletePitchValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la cancha es obligatorio.");
    }
}
