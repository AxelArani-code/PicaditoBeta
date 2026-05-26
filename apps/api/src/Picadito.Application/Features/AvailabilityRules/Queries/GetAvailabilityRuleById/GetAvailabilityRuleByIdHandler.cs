using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.AvailabilityRules.Queries.GetAvailabilityRuleById;

public class GetAvailabilityRuleByIdHandler(
    IAvailabilityRuleRepository availabilityRuleRepository,
    IValidator<GetAvailabilityRuleByIdQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAvailabilityRuleByIdHandler> logger)
{
    private readonly ILogger<GetAvailabilityRuleByIdHandler> _logger = logger;

    public async Task<ErrorOr<AvailabilityRuleDto>> Handle(
        GetAvailabilityRuleByIdQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, RuleId: {RuleId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting get availability rule by ID. RuleId: {RuleId}", request.Id);

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

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            var result = await availabilityRuleRepository.GetByIdAsync(
                request.Id, userId, userRole, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning(
                    "Availability rule not found or access denied. RuleId: {RuleId}, UserId: {UserId}",
                    request.Id, userId);
                return result.Errors;
            }

            _logger.LogInformation(
                "Availability rule retrieved successfully. RuleId: {RuleId}, UserId: {UserId}",
                request.Id, userId);

            return result.Value;
        }
    }
}
