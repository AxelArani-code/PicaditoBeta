using FluentValidation;

namespace Picadito.Application.Features.Teams.Commands.CreateTeam;

/// <summary>
/// Validador para el comando de crear un equipo.
/// </summary>
public class CreateTeamCommandValidator : AbstractValidator<CreateTeamCommand>
{
    public CreateTeamCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("El nombre del equipo es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre no puede exceder los 200 caracteres.");

        RuleFor(x => x.LogoUrl)
            .Must(url => Uri.TryCreate(url!, UriKind.Absolute, out _))
            .WithMessage("La URL del logo no es válida.")
            .When(x => !string.IsNullOrEmpty(x.LogoUrl));
    }
}
