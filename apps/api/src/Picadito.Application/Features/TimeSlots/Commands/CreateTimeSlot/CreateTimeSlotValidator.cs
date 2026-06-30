using FluentValidation;

namespace Picadito.Application.Features.TimeSlots.Commands.CreateTimeSlot;

/// <summary>
/// Validador para el comando de creación de TimeSlot.
/// </summary>
public class CreateTimeSlotValidator : AbstractValidator<CreateTimeSlotCommand>
{
    public CreateTimeSlotValidator()
    {
        RuleFor(x => x.PitchId)
            .NotEmpty()
            .WithMessage("El ID de la cancha es obligatorio.");

        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.")
            .Matches(@"^\d{4}-\d{2}-\d{2}$")
            .WithMessage("La fecha debe tener el formato yyyy-MM-dd.");

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

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("El precio debe ser mayor a 0.");
    }
}
