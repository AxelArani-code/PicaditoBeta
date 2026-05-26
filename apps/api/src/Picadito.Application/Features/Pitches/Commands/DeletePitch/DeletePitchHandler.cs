using System;
using System.Diagnostics;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Pitches.Commands.DeletePitch;

public class DeletePitchHandler(
    IPitchRepository pitchRepository,
    IValidator<DeletePitchCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<DeletePitchHandler> logger)
{
    private readonly ILogger<DeletePitchHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeletePitchCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, PitchId: {PitchId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting pitch deletion. PitchId: {PitchId}", request.Id);

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
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            if (userRole == UserRole.player)
            {
                _logger.LogWarning("Player role not authorized to delete pitches. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden eliminar canchas.");
            }

            var pitch = await pitchRepository.GetPitchByIdAsync(request.Id, cancellationToken);
            if (pitch is null)
            {
                _logger.LogWarning("Pitch not found. PitchId: {PitchId}", request.Id);
                return DomainErrors.Pitch.NotFound;
            }

            if (!isAdmin)
            {
                var isOwner = await pitchRepository.IsOwnerAsync(request.Id, userId, cancellationToken);
                if (!isOwner)
                {
                    _logger.LogWarning(
                        "User is not owner of the pitch. UserId: {UserId}, PitchId: {PitchId}",
                        userId, request.Id);
                    return DomainErrors.Pitch.Forbidden;
                }
            }

            var result = await pitchRepository.DeleteAsync(request.Id, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Pitch deletion failed. PitchId: {PitchId}, ErrorCode: {ErrorCode}",
                    request.Id, result.FirstError.Code);
                return result.Errors;
            }

            _logger.LogInformation("Pitch deleted successfully. PitchId: {PitchId}, UserId: {UserId}", request.Id, userId);

            return result.Value;
        }
    }
}
