using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.AvailabilityRules.Commands.CreateAvailabilityRule;

public class CreateAvailabilityRuleHandler(
    IAvailabilityRuleRepository availabilityRuleRepository,
    IValidator<CreateAvailabilityRuleCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateAvailabilityRuleHandler> logger)
{
    private readonly ILogger<CreateAvailabilityRuleHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateAvailabilityRuleCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Starting availability rule creation for PitchId: {PitchId}, DayOfWeek: {DayOfWeek}",
                request.PitchId, request.DayOfWeek);

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

            if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
            {
                _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            if (userRole == UserRole.player)
            {
                _logger.LogWarning("Player role not authorized to create availability rules. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear reglas de disponibilidad.");
            }

            if (!Enum.TryParse<DayOfWeek>(request.DayOfWeek, true, out var dayOfWeek))
            {
                _logger.LogWarning("Invalid day of week: {DayOfWeek}", request.DayOfWeek);
                return Error.Validation("DayOfWeek", "El día de la semana no es válido.");
            }

            if (!TimeSpan.TryParse(request.StartTime, out var startTime) ||
                !TimeSpan.TryParse(request.EndTime, out var endTime))
            {
                _logger.LogWarning("Invalid time format. StartTime: {StartTime}, EndTime: {EndTime}",
                    request.StartTime, request.EndTime);
                return Error.Validation("TimeFormat", "El formato de hora no es válido. Use HH:mm.");
            }

            if (startTime >= endTime)
            {
                _logger.LogWarning("Start time must be before end time. StartTime: {StartTime}, EndTime: {EndTime}",
                    startTime, endTime);
                return DomainErrors.AvailabilityRule.InvalidTimeRange;
            }

            var pitchExists = await availabilityRuleRepository.PitchExistsAndIsActiveAsync(
                request.PitchId, cancellationToken);
            if (!pitchExists)
            {
                _logger.LogWarning(
                    "Attempted to create a rule for a non-existent or soft-deleted pitch. PitchId: {PitchId}",
                    request.PitchId);
                return DomainErrors.Pitch.NotFound;
            }

            if (!isAdmin)
            {
                var isPitchOwner = await availabilityRuleRepository.IsPitchOwnerAsync(
                    request.PitchId, userId, cancellationToken);
                if (!isPitchOwner)
                {
                    _logger.LogWarning(
                        "User is not owner of the pitch's venue. UserId: {UserId}, PitchId: {PitchId}",
                        userId, request.PitchId);
                    return DomainErrors.AvailabilityRule.PitchForbidden;
                }
            }

            var rule = new AvailabilityRule(
                request.PitchId,
                dayOfWeek,
                startTime,
                endTime,
                request.PriceOverride);

            var result = await availabilityRuleRepository.AddAsync(rule, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Availability rule created successfully. RuleId: {RuleId}, PitchId: {PitchId}, DayOfWeek: {DayOfWeek}",
                result.Value, rule.PitchId, rule.DayOfWeek);

            return result.Value;
        }
    }
}
