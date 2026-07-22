using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.VenueClosures.Queries.GetAllVenueClosures;

public class GetAllVenueClosuresHandler(
    IVenueClosureRepository venueClosureRepository,
    IValidator<GetAllVenueClosuresQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetAllVenueClosuresHandler> logger)
{
    private readonly ILogger<GetAllVenueClosuresHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<VenueClosureDto>>> Handle(
        GetAllVenueClosuresQuery request, CancellationToken cancellationToken)
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
            "GetAllVenueClosures request started: UserId={UserId}, Role={Role}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.PitchId, request.PageNumber, request.PageSize);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetAllVenueClosures validation failed: UserId={UserId}, Errors={Errors}",
                    userId, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Parsear filtros de fecha opcionales
            DateOnly? fromDate = null;
            DateOnly? toDate = null;

            if (!string.IsNullOrEmpty(request.FromDate))
            {
                if (!DateOnly.TryParse(request.FromDate, out var parsedFrom))
                {
                    return Error.Validation("FromDate", "El formato de 'Desde' no es válido. Use yyyy-MM-dd.");
                }
                fromDate = parsedFrom;
            }

            if (!string.IsNullOrEmpty(request.ToDate))
            {
                if (!DateOnly.TryParse(request.ToDate, out var parsedTo))
                {
                    return Error.Validation("ToDate", "El formato de 'Hasta' no es válido. Use yyyy-MM-dd.");
                }
                toDate = parsedTo;
            }

            var result = await venueClosureRepository.GetAllAsync(
                request.PitchId,
                fromDate,
                toDate,
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
                    "[SLOW QUERY] GetAllVenueClosures: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PitchId, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllVenueClosures completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetAllVenueClosures error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
