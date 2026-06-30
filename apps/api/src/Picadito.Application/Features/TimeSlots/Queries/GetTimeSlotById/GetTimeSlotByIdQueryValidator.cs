using FluentValidation;

namespace Picadito.Application.Features.TimeSlots.Queries.GetTimeSlotById;

/// <summary>
/// Validador para la query de obtención de TimeSlot por ID.
/// </summary>
public class GetTimeSlotByIdQueryValidator : AbstractValidator<GetTimeSlotByIdQuery>
{
    public GetTimeSlotByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del turno es obligatorio.");
    }
}
