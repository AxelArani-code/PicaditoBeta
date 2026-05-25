using System;
using System.Diagnostics;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Profiles.Commands.DeleteProfile;

public class DeleteProfileHandler(
    IProfileRepository profileRepository,
    IValidator<DeleteProfileCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<DeleteProfileHandler> logger)
{
    private readonly ILogger<DeleteProfileHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteProfileCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, ProfileId: {ProfileId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting profile deletion. ProfileId: {ProfileId}", request.Id);

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Unauthorized access attempt");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
            {
                _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            var profile = await profileRepository.GetByIdAsync(request.Id, cancellationToken);
            if (profile is null)
            {
                _logger.LogWarning("Profile not found. ProfileId: {ProfileId}", request.Id);
                return DomainErrors.Profile.NotFound;
            }

            if (!isAdmin && profile.Id != userId)
            {
                _logger.LogWarning(
                    "User attempted to delete another user's profile. UserId: {UserId}, TargetProfileId: {ProfileId}",
                    userId, request.Id);
                return DomainErrors.Profile.Forbidden;
            }

            var result = await profileRepository.DeleteAsync(request.Id, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Profile deletion failed. ProfileId: {ProfileId}, ErrorCode: {ErrorCode}",
                    request.Id, result.FirstError.Code);
                return result.Errors;
            }

            _logger.LogInformation("Profile deleted successfully. ProfileId: {ProfileId}, UserId: {UserId}", request.Id, userId);

            return result.Value;
        }
    }
}
