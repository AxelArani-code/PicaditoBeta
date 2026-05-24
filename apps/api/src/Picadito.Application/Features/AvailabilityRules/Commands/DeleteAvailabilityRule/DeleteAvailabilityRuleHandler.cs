using System.Diagnostics;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.AvailabilityRules.Commands.DeleteAvailabilityRule;

public class DeleteAvailabilityRuleHandler(
    IAvailabilityRuleRepository availabilityRuleRepository,
    IValidator<DeleteAvailabilityRuleCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<DeleteAvailabilityRuleHandler> logger)
{
    private readonly ILogger<DeleteAvailabilityRuleHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteAvailabilityRuleCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, RuleId: {RuleId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting availability rule deletion. RuleId: {RuleId}", request.Id);

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
                _logger.LogWarning("Player role not authorized to delete availability rules. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden eliminar reglas de disponibilidad.");
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

            var result = await availabilityRuleRepository.DeleteAsync(request.Id, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Availability rule deletion failed. RuleId: {RuleId}, ErrorCode: {ErrorCode}",
                    request.Id, result.FirstError.Code);
                return result.Errors;
            }

            _logger.LogInformation(
                "Availability rule deleted successfully. RuleId: {RuleId}, UserId: {UserId}",
                request.Id, userId);

            return result.Value;
        }
    }
}
