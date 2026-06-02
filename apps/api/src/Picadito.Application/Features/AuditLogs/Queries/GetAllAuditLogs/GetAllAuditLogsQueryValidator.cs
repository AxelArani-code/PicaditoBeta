using FluentValidation;

namespace Picadito.Application.Features.AuditLogs.Queries.GetAllAuditLogs;

/// <summary>
/// Validador para la query de obtener todos los registros de auditoría.
/// </summary>
public class GetAllAuditLogsQueryValidator : AbstractValidator<GetAllAuditLogsQuery>
{
    public GetAllAuditLogsQueryValidator()
    {
        RuleFor(x => x.Action)
            .MaximumLength(100)
            .WithMessage("El filtro de acción no puede exceder los 100 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Action));

        RuleFor(x => x.Entity)
            .MaximumLength(100)
            .WithMessage("El filtro de entidad no puede exceder los 100 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Entity));

        RuleFor(x => x.EntityId)
            .MaximumLength(50)
            .WithMessage("El filtro de ID de entidad no puede exceder los 50 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.EntityId));

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El número de página debe ser mayor o igual a 1.")
            .When(x => x.PageNumber != 0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.")
            .When(x => x.PageSize != 0);
    }
}
