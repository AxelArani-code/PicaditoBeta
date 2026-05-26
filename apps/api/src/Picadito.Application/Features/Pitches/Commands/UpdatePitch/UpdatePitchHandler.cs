using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Pitches.Commands.UpdatePitch;

public class UpdatePitchHandler(
    IPitchRepository pitchRepository,
    IValidator<UpdatePitchCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdatePitchHandler> logger)
{
    private readonly ILogger<UpdatePitchHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdatePitchCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, PitchId: {PitchId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting pitch update. PitchId: {PitchId}", request.Id);

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
                _logger.LogWarning("Player role not authorized to update pitches. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden modificar canchas.");
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

            var type = ParsePitchType(request.Type);
            var surface = ParseSurfaceType(request.Surface);

            if (type is null || surface is null)
            {
                _logger.LogWarning("Invalid pitch type or surface. Type: {Type}, Surface: {Surface}", request.Type, request.Surface);
                return Error.Validation("Pitch.InvalidValue", "El tipo o la superficie de la cancha no son válidos.");
            }

            pitch.Update(request.Name, type.Value, surface.Value, request.PricePerHour, request.IsActive);

            var result = await pitchRepository.UpdateAsync(pitch, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Pitch updated successfully. PitchId: {PitchId}, Name: {Name}",
                pitch.Id, pitch.Name);

            return result.Value;
        }
    }

    private static PitchType? ParsePitchType(string type) => type switch
    {
        "5v5" => PitchType.FiveV5,
        "7v7" => PitchType.SevenV7,
        "9v9" => PitchType.NineV9,
        "11v11" => PitchType.ElevenV11,
        _ => null
    };

    private static SurfaceType? ParseSurfaceType(string surface) => surface switch
    {
        nameof(SurfaceType.cespedNatural) => SurfaceType.cespedNatural,
        nameof(SurfaceType.sintetico) => SurfaceType.sintetico,
        nameof(SurfaceType.cemento) => SurfaceType.cemento,
        nameof(SurfaceType.parquet) => SurfaceType.parquet,
        _ => null
    };
}
