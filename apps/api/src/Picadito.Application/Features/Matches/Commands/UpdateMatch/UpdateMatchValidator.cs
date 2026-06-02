using FluentValidation;

namespace Picadito.Application.Features.Matches.Commands.UpdateMatch;

/// <summary>
/// Validador para el comando de actualización parcial de un Match.
/// </summary>
public class UpdateMatchValidator : AbstractValidator<UpdateMatchCommand>
{
    private static readonly string[] ValidStatuses =
        ["played", "cancelled"];

    public UpdateMatchValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del partido es obligatorio.");

        // Si se proporciona HomeScore, AwayScore también debe estar presente (y viceversa)
        When(x => x.HomeScore.HasValue, () =>
        {
            RuleFor(x => x.AwayScore)
                .NotNull()
                .WithMessage("Debes proporcionar ambos marcadores (local y visitante).");
        });

        When(x => x.AwayScore.HasValue, () =>
        {
            RuleFor(x => x.HomeScore)
                .NotNull()
                .WithMessage("Debes proporcionar ambos marcadores (local y visitante).");
        });

        // Los marcadores no pueden ser negativos
        When(x => x.HomeScore.HasValue, () =>
        {
            RuleFor(x => x.HomeScore!.Value)
                .GreaterThanOrEqualTo(0)
                .WithMessage("El marcador local no puede ser negativo.");
        });

        When(x => x.AwayScore.HasValue, () =>
        {
            RuleFor(x => x.AwayScore!.Value)
                .GreaterThanOrEqualTo(0)
                .WithMessage("El marcador visitante no puede ser negativo.");
        });

        // Validar estado si se proporciona
        When(x => !string.IsNullOrEmpty(x.Status), () =>
        {
            RuleFor(x => x.Status!)
                .Must(status => ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"El estado debe ser uno de: {string.Join(", ", ValidStatuses)}.");
        });
    }
}
