using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Pitches.Queries.GetPitchById;

public class GetPitchByIdHandler(
    IPitchRepository pitchRepository,
    IValidator<GetPitchByIdQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetPitchByIdHandler> logger)
{
    private readonly ILogger<GetPitchByIdHandler> _logger = logger;

    public async Task<ErrorOr<PitchDto>> Handle(GetPitchByIdQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, PitchId: {PitchId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting get pitch by ID. PitchId: {PitchId}", request.Id);

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            var result = await pitchRepository.GetPitchByIdWithVenueAsync(request.Id, userId, userRole, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Pitch not found or access denied. PitchId: {PitchId}, UserId: {UserId}", request.Id, userId);
                return result.Errors;
            }

            _logger.LogInformation("Pitch retrieved successfully. PitchId: {PitchId}, UserId: {UserId}", request.Id, userId);

            return result.Value;
        }
    }
}
