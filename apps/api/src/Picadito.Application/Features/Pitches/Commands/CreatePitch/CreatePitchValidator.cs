using FluentValidation;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Pitches.Commands.CreatePitch;

public class CreatePitchValidator : AbstractValidator<CreatePitchCommand>
{
    private static readonly string[] ValidTypes =
    [
        "5v5",
        "7v7",
        "9v9",
        "11v11"
    ];

    private static readonly string[] ValidSurfaces =
    [
        nameof(SurfaceType.cespedNatural),
        nameof(SurfaceType.sintetico),
        nameof(SurfaceType.cemento),
        nameof(SurfaceType.parquet)
    ];

    public CreatePitchValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("El nombre de la cancha es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede exceder los 100 caracteres.");

        RuleFor(x => x.VenueId)
            .NotEmpty()
            .WithMessage("El ID del complejo deportivo es obligatorio.");

        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("El tipo de cancha es obligatorio.")
            .Must(type => ValidTypes.Contains(type))
            .WithMessage($"El tipo de cancha debe ser uno de: {string.Join(", ", ValidTypes)}.");

        RuleFor(x => x.Surface)
            .NotEmpty()
            .WithMessage("La superficie es obligatoria.")
            .Must(surface => ValidSurfaces.Contains(surface))
            .WithMessage($"La superficie debe ser una de: {string.Join(", ", ValidSurfaces)}.");

        RuleFor(x => x.PricePerHour)
            .GreaterThan(0)
            .WithMessage("El precio por hora debe ser mayor a 0.")
            .PrecisionScale(10, 2, true)
            .WithMessage("El precio por hora no puede tener más de 2 decimales.");
    }
}
