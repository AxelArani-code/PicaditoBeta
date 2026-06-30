using FluentValidation;

namespace Picadito.Application.Features.TeamMembers.Commands.CreateTeamMember;

/// <summary>
/// Validador para el comando de agregar un miembro al equipo.
/// </summary>
public class CreateTeamMemberCommandValidator : AbstractValidator<CreateTeamMemberCommand>
{
    public CreateTeamMemberCommandValidator()
    {
        RuleFor(x => x.TeamId)
            .NotEmpty()
            .WithMessage("El ID del equipo es obligatorio.");

        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("El ID del usuario es obligatorio.");

        RuleFor(x => x.Role)
            .Must(role => role == null || role == "player" || role == "captain")
            .WithMessage("El rol debe ser 'player' o 'captain'.")
            .When(x => !string.IsNullOrEmpty(x.Role));
    }
}
