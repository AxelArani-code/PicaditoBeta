using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Queries.GetAllVenues;

/// <summary>
/// Handler para obtener todos los complejos deportivos.
/// Acceso público (sin autenticación).
/// </summary>
public class GetAllVenuesHandler(
    IVenueRepository venueRepository,
    IValidator<GetAllVenuesQuery> validator,
    ILogger<GetAllVenuesHandler> logger)
{
    private readonly ILogger<GetAllVenuesHandler> _logger = logger;

    public async Task<ErrorOr<List<VenueDto>>> Handle(GetAllVenuesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllVenues requested: Name={Name}, Address={Address}, IsActive={IsActive}",
            request.Name, request.Address, request.IsActive);

        // Validación usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Consulta sin autenticación (acceso público)
        var venues = await venueRepository.GetAllAsync(
            request.Name,
            request.Address,
            request.IsActive,
            cancellationToken);

        _logger.LogInformation(
            "GetAllVenues completed: Count={Count}, Name={Name}, Address={Address}, IsActive={IsActive}",
            venues.Count, request.Name, request.Address, request.IsActive);

        return venues;
    }
}