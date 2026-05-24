using FluentValidation;

namespace Picadito.Application.Features.AvailabilityRules.Commands.CreateAvailabilityRule;

public class CreateAvailabilityRuleValidator : AbstractValidator<CreateAvailabilityRuleCommand>
{
    private static readonly string[] ValidDays =
    [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    public CreateAvailabilityRuleValidator()
    {
        RuleFor(x => x.PitchId)
            .NotEmpty()
            .WithMessage("El ID de la cancha es obligatorio.");

        RuleFor(x => x.DayOfWeek)
            .NotEmpty()
            .WithMessage("El día de la semana es obligatorio.")
            .Must(day => ValidDays.Contains(day, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"El día de la semana debe ser uno de: {string.Join(", ", ValidDays)}.");

        RuleFor(x => x.StartTime)
            .NotEmpty()
            .WithMessage("La hora de inicio es obligatoria.")
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$")
            .WithMessage("La hora de inicio debe tener el formato HH:mm.");

        RuleFor(x => x.EndTime)
            .NotEmpty()
            .WithMessage("La hora de fin es obligatoria.")
            .Matches(@"^([01]\d|2[0-3]):([0-5]\d)$")
            .WithMessage("La hora de fin debe tener el formato HH:mm.");

        RuleFor(x => x.PriceOverride)
            .GreaterThan(0)
            .When(x => x.PriceOverride.HasValue)
            .WithMessage("El precio personalizado debe ser mayor a 0.");
    }
}
