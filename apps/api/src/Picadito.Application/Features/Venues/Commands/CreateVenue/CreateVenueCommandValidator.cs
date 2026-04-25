using FluentValidation;

namespace Picadito.Application.Features.Venues.Commands.CreateVenue;

/// <summary>
/// Validador para el comando de crear un complejo deportivo.
/// </summary>
public class CreateVenueCommandValidator : AbstractValidator<CreateVenueCommand>
{
    public CreateVenueCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre no puede exceder los 200 caracteres.");

        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("La dirección es obligatoria.")
            .MaximumLength(500)
            .WithMessage("La dirección no puede exceder los 500 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("La descripción no puede exceder los 2000 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("La ciudad es obligatoria.")
            .MaximumLength(100)
            .WithMessage("La ciudad no puede exceder los 100 caracteres.");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("El teléfono no puede exceder los 20 caracteres.")
            .Matches(@"^\+?[0-9\s\-]+$").WithMessage("El formato del teléfono no es válido.")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Images)
            .Must(images => images == null || images.Count <= 5)
            .WithMessage("No puedes subir más de 5 imágenes.")
            .Must(images => images == null || images.All(url => Uri.TryCreate(url, UriKind.Absolute, out _)))
            .WithMessage("Una o más URLs de imágenes no son válidas.")
            .When(x => x.Images != null);
    }
}