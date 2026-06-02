using FluentValidation;

namespace Picadito.Application.Features.TimeSlots.Queries.GetAllTimeSlots;

/// <summary>
/// Validador para la query de listado de TimeSlots.
/// </summary>
public class GetAllTimeSlotsQueryValidator : AbstractValidator<GetAllTimeSlotsQuery>
{
    public GetAllTimeSlotsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("El número de página debe ser mayor a 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("El tamaño de página debe estar entre 1 y 100.");

        When(x => !string.IsNullOrEmpty(x.Date), () =>
        {
            RuleFor(x => x.Date!)
                .Matches(@"^\d{4}-\d{2}-\d{2}$")
                .WithMessage("La fecha debe tener el formato yyyy-MM-dd.");
        });
    }
}
