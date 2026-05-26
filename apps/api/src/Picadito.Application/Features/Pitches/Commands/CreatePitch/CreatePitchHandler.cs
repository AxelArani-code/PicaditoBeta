using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Pitches.Commands.CreatePitch;

public class CreatePitchHandler(
    IPitchRepository pitchRepository,
    IVenueRepository venueRepository,
    IValidator<CreatePitchCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreatePitchHandler> logger)
{
    private readonly ILogger<CreatePitchHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreatePitchCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting pitch creation for Name: {Name}, VenueId: {VenueId}", request.Name, request.VenueId);

            // Validación con FluentValidation
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
            var isOwner = userRole == UserRole.venue_owner;

            // Solo venue_owners y admins pueden crear canchas
            if (userRole == UserRole.player)
            {
                _logger.LogWarning("Player role not authorized to create pitches. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear canchas.");
            }

            if (userRole != UserRole.venue_owner && !isAdmin)
            {
                _logger.LogWarning("User role not authorized. UserId: {UserId}, Role: {Role}", userId, userRole);
                return Error.Forbidden(description: "No tienes permisos para crear canchas.");
            }

            // Validar que el Venue existe
            var venue = await venueRepository.GetEntityByIdAsync(request.VenueId, cancellationToken);
            if (venue is null)
            {
                _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.VenueId);
                return DomainErrors.Pitch.VenueNotFound;
            }

            // RLS: Admin puede asignar cualquier VenueId; Owner debe verificar que el Venue le pertenezca
            if (!isAdmin)
            {
                var isVenueOwner = await venueRepository.IsOwnerAsync(request.VenueId, userId, cancellationToken);
                if (!isVenueOwner)
                {
                    _logger.LogWarning(
                        "User is not owner of the venue. UserId: {UserId}, VenueId: {VenueId}",
                        userId, request.VenueId);
                    return DomainErrors.Pitch.VenueForbidden;
                }
            }

            // Parsear los valores de string a enum usando el mapping de PitchConfiguration
            var type = ParsePitchType(request.Type);
            var surface = ParseSurfaceType(request.Surface);

            if (type is null || surface is null)
            {
                _logger.LogWarning("Invalid pitch type or surface. Type: {Type}, Surface: {Surface}", request.Type, request.Surface);
                return Error.Validation("Pitch.InvalidValue", "El tipo o la superficie de la cancha no son válidos.");
            }

            // Crear la entidad Pitch usando el constructor público
            var pitch = new Pitch(
                request.Name,
                request.VenueId,
                type.Value,
                surface.Value,
                request.PricePerHour);

            // Persistir
            var result = await pitchRepository.AddAsync(pitch, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Pitch created successfully. PitchId: {PitchId}, Name: {Name}, VenueId: {VenueId}",
                result.Value, pitch.Name, pitch.VenueId);

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
