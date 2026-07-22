using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.VenueClosures.Commands.CreateVenueClosure;

public class CreateVenueClosureHandler(
    IVenueClosureRepository venueClosureRepository,
    IValidator<CreateVenueClosureCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateVenueClosureHandler> logger)
{
    private readonly ILogger<CreateVenueClosureHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateVenueClosureCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Iniciando creación de cierre para PitchId: {PitchId}, Fecha: {ClosureDate}",
                request.PitchId, request.ClosureDate);

            // Validación de formato con FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validación fallida. Errores: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Verificar autenticación
            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            // Validar que el rol sea reconocido
            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            // Los jugadores no pueden crear cierres (política RLS)
            if (userRole == UserRole.player)
            {
                _logger.LogWarning("Player role not authorized to create venue closures. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear cierres.");
            }

            // Parsear la fecha
            if (!DateOnly.TryParse(request.ClosureDate, out var closureDate))
            {
                return Error.Validation("ClosureDate", "La fecha de cierre no es válida.");
            }

            // Validar que la fecha no sea pasada
            if (closureDate < DateOnly.FromDateTime(DateTime.UtcNow))
            {
                _logger.LogWarning(
                    "Attempted to create a closure with a past date. Date: {ClosureDate}", closureDate);
                return DomainErrors.VenueClosure.PastDate;
            }

            // Parsear horas (pueden ser NULL para cierre de día completo)
            TimeSpan? startTime = null;
            TimeSpan? endTime = null;

            if (!string.IsNullOrEmpty(request.StartTime))
            {
                if (!TimeSpan.TryParse(request.StartTime, out var parsedStart))
                {
                    return Error.Validation("StartTime", "El formato de la hora de inicio no es válido. Use HH:mm.");
                }
                startTime = parsedStart;
            }

            if (!string.IsNullOrEmpty(request.EndTime))
            {
                if (!TimeSpan.TryParse(request.EndTime, out var parsedEnd))
                {
                    return Error.Validation("EndTime", "El formato de la hora de fin no es válido. Use HH:mm.");
                }
                endTime = parsedEnd;
            }

            // Si se proporcionaron ambas horas, validar que start < end
            if (startTime.HasValue && endTime.HasValue && startTime.Value >= endTime.Value)
            {
                _logger.LogWarning(
                    "Start time must be before end time. StartTime: {StartTime}, EndTime: {EndTime}",
                    startTime, endTime);
                return DomainErrors.VenueClosure.InvalidTimeRange;
            }

            // Si especificó una cancha, verificar que exista y esté activa
            if (request.PitchId.HasValue)
            {
                var pitchExists = await venueClosureRepository.PitchExistsAndIsActiveAsync(
                    request.PitchId.Value, cancellationToken);
                if (!pitchExists)
                {
                    _logger.LogWarning(
                        "Attempted to create a closure for a non-existent or soft-deleted pitch. PitchId: {PitchId}",
                        request.PitchId.Value);
                    return DomainErrors.VenueClosure.PitchNotFound;
                }

                // Validar permisos de propiedad sobre la cancha (si no es admin)
                if (!isAdmin)
                {
                    var isPitchOwner = await venueClosureRepository.IsPitchOwnerAsync(
                        request.PitchId.Value, userId, cancellationToken);
                    if (!isPitchOwner)
                    {
                        _logger.LogWarning(
                            "User is not owner of the pitch's venue. UserId: {UserId}, PitchId: {PitchId}",
                            userId, request.PitchId.Value);
                        return DomainErrors.VenueClosure.PitchForbidden;
                    }
                }
            }
            // Si es un cierre global (PitchId null) y no es admin, el owner debe tener al menos un venue
            else if (!isAdmin && userRole == UserRole.venue_owner)
            {
                // El RLS policy permite que venue owners creen cierres globales
                // No hacemos validación extra aquí porque el repositorio se encarga
                _logger.LogInformation(
                    "Global closure (no specific pitch) being created by venue owner. UserId: {UserId}", userId);
            }

            var closure = new VenueClosure(
                request.PitchId,
                closureDate,
                startTime,
                endTime,
                request.Reason);

            var result = await venueClosureRepository.AddAsync(closure, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue closure created successfully. ClosureId: {ClosureId}, PitchId: {PitchId}, Date: {ClosureDate}",
                result.Value, closure.PitchId, closure.ClosureDate);

            return result.Value;
        }
    }
}
