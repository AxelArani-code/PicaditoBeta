using FluentValidation;

namespace Picadito.Application.Features.Notifications.Commands.CreateNotification;

/// <summary>
/// Validador para el comando de crear una notificación.
/// </summary>
public class CreateNotificationCommandValidator : AbstractValidator<CreateNotificationCommand>
{
    public CreateNotificationCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("El ID del usuario es obligatorio.");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("El título es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El título no puede exceder los 500 caracteres.");

        RuleFor(x => x.Message)
            .NotEmpty()
            .WithMessage("El mensaje es obligatorio.")
            .MaximumLength(2000)
            .WithMessage("El mensaje no puede exceder los 2000 caracteres.");

        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("El tipo de notificación es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El tipo no puede exceder los 100 caracteres.");

        RuleFor(x => x.Link)
            .MaximumLength(500)
            .WithMessage("El enlace no puede exceder los 500 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Link));
    }
}
