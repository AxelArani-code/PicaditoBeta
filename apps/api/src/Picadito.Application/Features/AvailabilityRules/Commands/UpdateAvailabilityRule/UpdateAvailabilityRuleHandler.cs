using System.Diagnostics;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.AvailabilityRules.Commands.UpdateAvailabilityRule;

public class UpdateAvailabilityRuleHandler(
    IAvailabilityRuleRepository availabilityRuleRepository,
    IValidator<UpdateAvailabilityRuleCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateAvailabilityRuleHandler> logger)
{
    private readonly ILogger<UpdateAvailabilityRuleHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateAvailabilityRuleCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, RuleId: {RuleId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting availability rule update. RuleId: {RuleId}", request.Id);

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
                _logger.LogWarning("Player role not authorized to update availability rules. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden modificar reglas de disponibilidad.");
            }

            var rule = await availabilityRuleRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (rule is null)
            {
                _logger.LogWarning("Availability rule not found. RuleId: {RuleId}", request.Id);
                return DomainErrors.AvailabilityRule.NotFound;
            }

            if (!isAdmin)
            {
                var isOwner = await availabilityRuleRepository.IsOwnerAsync(request.Id, userId, cancellationToken);
                if (!isOwner)
                {
                    _logger.LogWarning(
                        "User is not owner of the availability rule's venue. UserId: {UserId}, RuleId: {RuleId}",
                        userId, request.Id);
                    return DomainErrors.AvailabilityRule.Forbidden;
                }
            }

            var dayOfWeek = rule.DayOfWeek;
            if (!string.IsNullOrEmpty(request.DayOfWeek))
            {
                if (!Enum.TryParse<DayOfWeek>(request.DayOfWeek, true, out var parsedDay))
                {
                    _logger.LogWarning("Invalid day of week: {DayOfWeek}", request.DayOfWeek);
                    return Error.Validation("DayOfWeek", "El día de la semana no es válido.");
                }
                dayOfWeek = parsedDay;
            }

            var startTime = rule.StartTime;
            if (!string.IsNullOrEmpty(request.StartTime))
            {
                if (!TimeSpan.TryParse(request.StartTime, out var parsedStart))
                {
                    _logger.LogWarning("Invalid start time format: {StartTime}", request.StartTime);
                    return Error.Validation("StartTime", "El formato de hora de inicio no es válido. Use HH:mm.");
                }
                startTime = parsedStart;
            }

            var endTime = rule.EndTime;
            if (!string.IsNullOrEmpty(request.EndTime))
            {
                if (!TimeSpan.TryParse(request.EndTime, out var parsedEnd))
                {
                    _logger.LogWarning("Invalid end time format: {EndTime}", request.EndTime);
                    return Error.Validation("EndTime", "El formato de hora de fin no es válido. Use HH:mm.");
                }
                endTime = parsedEnd;
            }

            if (startTime >= endTime)
            {
                _logger.LogWarning("Start time must be before end time. StartTime: {StartTime}, EndTime: {EndTime}",
                    startTime, endTime);
                return DomainErrors.AvailabilityRule.InvalidTimeRange;
            }

            var priceOverride = request.PriceOverride ?? rule.PriceOverride;

            rule.Update(dayOfWeek, startTime, endTime, priceOverride);

            var result = await availabilityRuleRepository.UpdateAsync(rule, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Availability rule updated successfully. RuleId: {RuleId}, PitchId: {PitchId}, DayOfWeek: {DayOfWeek}",
                rule.Id, rule.PitchId, rule.DayOfWeek);

            return result.Value;
        }
    }
}
