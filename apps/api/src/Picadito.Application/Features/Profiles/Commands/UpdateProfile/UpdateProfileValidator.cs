using FluentValidation;

namespace Picadito.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del perfil es obligatorio.");

        RuleFor(x => x.Username)
            .MaximumLength(50)
            .WithMessage("El nombre de usuario no puede exceder los 50 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Username));

        RuleFor(x => x.FullName)
            .MaximumLength(100)
            .WithMessage("El nombre completo no puede exceder los 100 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.FullName));

        RuleFor(x => x.AvatarUrl)
            .MaximumLength(500)
            .WithMessage("La URL del avatar no puede exceder los 500 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl));

        RuleFor(x => x.Role)
            .Must(role => role == null || IsValidRole(role))
            .WithMessage("El rol debe ser 'player', 'venue_owner' o 'admin'.");
    }

    private static bool IsValidRole(string role)
    {
        return role == "player" || role == "venue_owner" || role == "admin";
    }
}
