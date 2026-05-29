using FluentValidation;

namespace Picadito.Application.Features.TeamMembers.Commands.UpdateTeamMember;

/// <summary>
/// Validador para el comando de actualizar un miembro del equipo.
/// </summary>
public class UpdateTeamMemberCommandValidator : AbstractValidator<UpdateTeamMemberCommand>
{
    public UpdateTeamMemberCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del miembro es obligatorio.");

        RuleFor(x => x.Role)
            .Must(role => role == "player" || role == "captain")
            .WithMessage("El rol debe ser 'player' o 'captain'.")
            .When(x => !string.IsNullOrEmpty(x.Role));
    }
}
