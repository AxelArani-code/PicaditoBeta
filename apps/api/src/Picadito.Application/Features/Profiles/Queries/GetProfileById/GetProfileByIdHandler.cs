using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;

namespace Picadito.Application.Features.Profiles.Queries.GetProfileById;

public class GetProfileByIdHandler(
    IProfileRepository profileRepository,
    IValidator<GetProfileByIdQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetProfileByIdHandler> logger)
{
    private readonly ILogger<GetProfileByIdHandler> _logger = logger;

    public async Task<ErrorOr<ProfileDto>> Handle(GetProfileByIdQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, ProfileId: {ProfileId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting get profile by ID. ProfileId: {ProfileId}", request.Id);

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

            // 🛑 RESTRICCIÓN: Solo administradores pueden ver perfiles por ID
            if (userRole != UserRole.admin) // Nota: Asegúrate de que 'Admin' empiece con mayúscula según tu Enum
            {
                _logger.LogWarning("Non-admin user attempted to get profile by ID. UserId: {UserId}, Role: {Role}", userId, userRole);
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

            var isAdmin = currentUserService.IsAdmin;

            var result = await profileRepository.GetProfileByIdAsync(request.Id, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Profile not found. ProfileId: {ProfileId}, UserId: {UserId}", request.Id, userId);
                return result.Errors;
            }

            _logger.LogInformation("Profile retrieved successfully. ProfileId: {ProfileId}", request.Id);

            return result.Value;
        }
    }
}
