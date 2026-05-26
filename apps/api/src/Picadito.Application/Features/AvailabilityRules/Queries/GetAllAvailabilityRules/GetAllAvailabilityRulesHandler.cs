using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.AvailabilityRules.Queries.GetAllAvailabilityRules;

public class GetAllAvailabilityRulesHandler(
    IAvailabilityRuleRepository availabilityRuleRepository,
    IValidator<GetAllAvailabilityRulesQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllAvailabilityRulesHandler> logger)
{
    private readonly ILogger<GetAllAvailabilityRulesHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<AvailabilityRuleDto>>> Handle(
        GetAllAvailabilityRulesQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        if (currentUserService.UserId is null)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

        _logger.LogInformation(
            "GetAllAvailabilityRules request started: UserId={UserId}, Role={Role}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.PitchId, request.PageNumber, request.PageSize);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetAllAvailabilityRules validation failed: UserId={UserId}, Errors={Errors}",
                    userId, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            var result = await availabilityRuleRepository.GetAllAsync(
                request.PitchId,
                userId,
                userRole,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAvailabilityRules: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PitchId, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAvailabilityRules completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetAllAvailabilityRules error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
