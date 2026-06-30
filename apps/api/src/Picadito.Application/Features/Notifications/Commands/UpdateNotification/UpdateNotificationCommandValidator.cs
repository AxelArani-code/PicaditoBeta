using FluentValidation;

namespace Picadito.Application.Features.Notifications.Commands.UpdateNotification;

/// <summary>
/// Validador para el comando de actualizar una notificación.
/// </summary>
public class UpdateNotificationCommandValidator : AbstractValidator<UpdateNotificationCommand>
{
    public UpdateNotificationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la notificación es obligatorio.");
    }
}
