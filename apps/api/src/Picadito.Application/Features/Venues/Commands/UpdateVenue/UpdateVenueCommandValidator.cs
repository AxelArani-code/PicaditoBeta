using FluentValidation;

namespace Picadito.Application.Features.Venues.Commands.UpdateVenue;

/// <summary>
/// Validador para el comando de actualizar un complejo deportivo.
/// </summary>
public class UpdateVenueCommandValidator : AbstractValidator<UpdateVenueCommand>
{
    public UpdateVenueCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del complejo es obligatorio.");

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("El nombre no puede exceder los 200 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("La dirección no puede exceder los 500 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Address));

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("La ciudad no puede exceder los 100 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.City));

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

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("La descripción no puede exceder los 2000 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x)
            .Must(x => !string.IsNullOrEmpty(x.Name)
                || !string.IsNullOrEmpty(x.Address) 
                || !string.IsNullOrEmpty(x.City)
                || !string.IsNullOrEmpty(x.Phone)
                || !string.IsNullOrEmpty(x.Description) 
                || (x.Images != null && x.Images.Any())
                || x.IsActive.HasValue)
            .WithMessage("Debe proporcionar al menos un campo para actualizar.");
    }
}