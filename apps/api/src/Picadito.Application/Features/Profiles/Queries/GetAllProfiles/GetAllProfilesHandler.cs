using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;

namespace Picadito.Application.Features.Profiles.Queries.GetAllProfiles;

public class GetAllProfilesHandler(
    IProfileRepository profileRepository,
    IValidator<GetAllProfilesQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllProfilesHandler> logger)
{
    private readonly ILogger<GetAllProfilesHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<ProfileDto>>> Handle(GetAllProfilesQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting get all profiles request");

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Unauthorized access attempt");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            if (userRole != UserRole.admin)
            {
                _logger.LogWarning("Non-admin user attempted to list all profiles. UserId: {UserId}, Role: {Role}", userId, userRole);
                return DomainErrors.Profile.AdminOnly;
            }

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            var result = await profileRepository.GetAllAsync(
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "GetAllProfiles completed: PageNumber={PageNumber}, PageSize={PageSize}, TotalCount={TotalCount}",
                request.PageNumber, request.PageSize, result.Value.TotalCount);

            return result.Value;
        }
    }
}
