using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.Extensions.Logging;
using ErrorOr;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.VenueClosures.Queries.GetVenueClosureById;

public class GetVenueClosureByIdHandler(
    IVenueClosureRepository venueClosureRepository,
    ICurrentUserService currentUserService,
    ILogger<GetVenueClosureByIdHandler> logger)
{
    private readonly ILogger<GetVenueClosureByIdHandler> _logger = logger;

    public async Task<ErrorOr<VenueClosureDto>> Handle(
        GetVenueClosureByIdQuery request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Obteniendo cierre por ID. ClosureId: {ClosureId}", request.Id);

            if (currentUserService.UserId is null)
            {
                return Error.Unauthorized(description: "Usuario no autenticado.");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var result = await venueClosureRepository.GetByIdAsync(
                request.Id, userId, userRole, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning(
                    "Venue closure not found or access denied. ClosureId: {ClosureId}, UserId: {UserId}",
                    request.Id, userId);
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue closure retrieved successfully. ClosureId: {ClosureId}", request.Id);

            return result.Value;
        }
    }
}
