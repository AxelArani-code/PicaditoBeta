using FluentValidation;

namespace Picadito.Application.Features.Teams.Commands.UpdateTeam;

/// <summary>
/// Validador para el comando de actualizar un equipo.
/// </summary>
public class UpdateTeamCommandValidator : AbstractValidator<UpdateTeamCommand>
{
    public UpdateTeamCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del equipo es obligatorio.");

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("El nombre no puede exceder los 200 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.LogoUrl)
            .Must(url => Uri.TryCreate(url!, UriKind.Absolute, out _))
            .WithMessage("La URL del logo no es válida.")
            .When(x => !string.IsNullOrEmpty(x.LogoUrl));

        RuleFor(x => x)
            .Must(x => !string.IsNullOrEmpty(x.Name) || !string.IsNullOrEmpty(x.LogoUrl) || x.CaptainId.HasValue)
            .WithMessage("Debe proporcionar al menos un campo para actualizar.");
    }
}
