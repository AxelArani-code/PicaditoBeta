using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.VenueRatings.Queries.GetAllVenueRatings;

/// <summary>
/// Handler para obtener calificaciones.
/// Acceso público según la política RLS "Ratings viewable by everyone".
/// </summary>
public class GetAllVenueRatingsHandler(
    IVenueRatingRepository venueRatingRepository,
    IValidator<GetAllVenueRatingsQuery> validator,
    ILogger<GetAllVenueRatingsHandler> logger)
{
    private readonly ILogger<GetAllVenueRatingsHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<VenueRatingDto>>> Handle(GetAllVenueRatingsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllVenueRatings requested: VenueId={VenueId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.VenueId, request.UserId, request.PageNumber, request.PageSize);

        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        var result = await venueRatingRepository.GetAllAsync(
            request.VenueId,
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllVenueRatings completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
            result.Value.PageNumber, result.Value.PageSize, result.Value.Items.Count, result.Value.TotalCount);

        return result.Value;
    }
}
