using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Queries.GetAllVenues;

/// <summary>
/// Handler para obtener todos los complejos deportivos con paginación.
/// Acceso público (sin autenticación).
/// </summary>
public class GetAllVenuesHandler(
    IVenueRepository venueRepository,
    IValidator<GetAllVenuesQuery> validator,
    ILogger<GetAllVenuesHandler> logger)
{
    private readonly ILogger<GetAllVenuesHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<VenueDto>>> Handle(GetAllVenuesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllVenues requested: Name={Name}, Address={Address}, IsActive={IsActive}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.Name, request.Address, request.IsActive, request.PageNumber, request.PageSize);

        // Validación usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Calcular el valor de skip basado en la fórmula: (PageNumber - 1) * PageSize
        var skip = (request.PageNumber - 1) * request.PageSize;
        _logger.LogDebug("Calculated skip value: {Skip} for PageNumber: {PageNumber}, PageSize: {PageSize}",
            skip, request.PageNumber, request.PageSize);

        // Consulta al repositorio con paginación
        var result = await venueRepository.GetAllAsync(
            request.Name,
            request.Address,
            request.IsActive,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllVenues completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}, TotalPages={TotalPages}",
            result.Value.PageNumber,
            result.Value.PageSize,
            result.Value.Items.Count,
            result.Value.TotalCount,
            result.Value.TotalPages);

        return result.Value;
    }
}