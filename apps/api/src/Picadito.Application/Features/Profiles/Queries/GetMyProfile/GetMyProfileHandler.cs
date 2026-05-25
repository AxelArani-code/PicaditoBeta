using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Profiles.Queries.GetMyProfile;

public class GetMyProfileHandler(
    IProfileRepository profileRepository,
    ICurrentUserService currentUserService,
    ILogger<GetMyProfileHandler> logger)
{
    private readonly ILogger<GetMyProfileHandler> _logger = logger;

    public async Task<ErrorOr<ProfileDto>> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var correlationId = System.Diagnostics.Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting get my profile request");

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Unauthorized access attempt");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            var result = await profileRepository.GetMyProfileAsync(userId, cancellationToken);

            if (result.IsError)
            {
                _logger.LogWarning("Profile not found for user. UserId: {UserId}", userId);
                return result.Errors;
            }

            _logger.LogInformation("Profile retrieved successfully. UserId: {UserId}", userId);

            return result.Value;
        }
    }
}
