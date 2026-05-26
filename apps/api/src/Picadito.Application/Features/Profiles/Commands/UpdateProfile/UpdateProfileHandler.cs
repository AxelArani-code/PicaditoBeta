using System;
using System.Diagnostics;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Profiles.Commands.UpdateProfile;

public class UpdateProfileHandler(
    IProfileRepository profileRepository,
    IValidator<UpdateProfileCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateProfileHandler> logger)
{
    private readonly ILogger<UpdateProfileHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, ProfileId: {ProfileId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting profile update. ProfileId: {ProfileId}", request.Id);

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

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            var profile = await profileRepository.GetByIdAsync(request.Id, cancellationToken);
            if (profile is null)
            {
                _logger.LogWarning("Profile not found. ProfileId: {ProfileId}", request.Id);
                return DomainErrors.Profile.NotFound;
            }

            // Validar seguridad del cambio de Rol antes de modificar cualquier campo
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                if (!isAdmin)
                {
                    _logger.LogWarning("Non-admin user attempted to update role. UserId: {UserId}", userId);
                    return DomainErrors.Profile.Forbidden; // O el error específico que uses para esto
                }

                profile.UpdateRole(request.Role);
            }

            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                var isUsernameTaken = await profileRepository.IsUsernameTakenAsync(request.Username, request.Id, cancellationToken);
                if (isUsernameTaken)
                {
                    _logger.LogWarning("Username already taken. Username: {Username}", request.Username);
                    return DomainErrors.Profile.UsernameTaken;
                }
            }

            profile.Update(request.Username, request.FullName, request.AvatarUrl);

            if (!string.IsNullOrWhiteSpace(request.Role) && isAdmin)
            {
                profile.UpdateRole(request.Role);
            }

            var result = await profileRepository.UpdateAsync(profile, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation("Profile updated successfully. ProfileId: {ProfileId}", request.Id);

            return result.Value;
        }
    }
}
