using FluentValidation;

namespace Picadito.Application.Features.AuditLogs.Commands.CreateAuditLog;

/// <summary>
/// Validador para el comando de crear un registro de auditoría.
/// </summary>
public class CreateAuditLogCommandValidator : AbstractValidator<CreateAuditLogCommand>
{
    public CreateAuditLogCommandValidator()
    {
        RuleFor(x => x.Action)
            .NotEmpty()
            .WithMessage("La acción es obligatoria.")
            .MaximumLength(100)
            .WithMessage("La acción no puede exceder los 100 caracteres.");

        RuleFor(x => x.Entity)
            .NotEmpty()
            .WithMessage("La entidad es obligatoria.")
            .MaximumLength(100)
            .WithMessage("La entidad no puede exceder los 100 caracteres.");

        RuleFor(x => x.EntityId)
            .NotEmpty()
            .WithMessage("El ID de la entidad es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El ID de la entidad no puede exceder los 50 caracteres.");
    }
}
