using FluentValidation;

namespace Picadito.Application.Features.AvailabilityRules.Commands.UpdateAvailabilityRule;

public class UpdateAvailabilityRuleValidator : AbstractValidator<UpdateAvailabilityRuleCommand>
{
    private static readonly string[] ValidDays =
    [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    public UpdateAvailabilityRuleValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la regla de disponibilidad es obligatorio.");

        RuleFor(x => x.DayOfWeek)
            .Must(day => ValidDays.Contains(day, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrEmpty(x.DayOfWeek))
            .WithMessage($"El día de la semana debe ser uno de: {string.Join(", ", ValidDays)}.");

        RuleFor(x => x.StartTime)
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$")
            .When(x => !string.IsNullOrEmpty(x.StartTime))
            .WithMessage("La hora de inicio debe tener el formato HH:mm.");

        RuleFor(x => x.EndTime)
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$")
            .When(x => !string.IsNullOrEmpty(x.EndTime))
            .WithMessage("La hora de fin debe tener el formato HH:mm.");

        RuleFor(x => x.PriceOverride)
            .GreaterThan(0)
            .When(x => x.PriceOverride.HasValue)
            .WithMessage("El precio personalizado debe ser mayor a 0.");
    }
}
