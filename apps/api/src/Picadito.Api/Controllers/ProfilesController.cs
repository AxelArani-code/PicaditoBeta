using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.Profiles.Queries.GetMyProfile;
using Picadito.Application.Features.Profiles.Queries.GetProfileById;
using Picadito.Application.Features.Profiles.Queries.GetAllProfiles;
using Picadito.Application.Features.Profiles.Commands.UpdateProfile;
using Picadito.Application.Features.Profiles.Commands.DeleteProfile;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    private readonly GetMyProfileHandler _getMyProfileHandler;
    private readonly GetProfileByIdHandler _getProfileByIdHandler;
    private readonly GetAllProfilesHandler _getAllProfilesHandler;
    private readonly UpdateProfileHandler _updateProfileHandler;
    private readonly DeleteProfileHandler _deleteProfileHandler;

    public ProfilesController(
        GetMyProfileHandler getMyProfileHandler,
        GetProfileByIdHandler getProfileByIdHandler,
        GetAllProfilesHandler getAllProfilesHandler,
        UpdateProfileHandler updateProfileHandler,
        DeleteProfileHandler deleteProfileHandler)
    {
        _getMyProfileHandler = getMyProfileHandler;
        _getProfileByIdHandler = getProfileByIdHandler;
        _getAllProfilesHandler = getAllProfilesHandler;
        _updateProfileHandler = updateProfileHandler;
        _deleteProfileHandler = deleteProfileHandler;
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var result = await _getMyProfileHandler.Handle(new GetMyProfileQuery(), cancellationToken);

        return result.Match(
            profile => Ok(profile),
            errors => Problem(errors)
        );
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllProfiles(
        [FromQuery] GetAllProfilesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllProfilesHandler.Handle(query, cancellationToken);

        return result.Match(
            profiles => Ok(profiles),
            errors => Problem(errors)
        );
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfileById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetProfileByIdQuery { Id = id };
        var result = await _getProfileByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            profile => Ok(profile),
            errors => Problem(errors)
        );
    }

    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(Success), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateProfile(
        Guid id,
        [FromBody] UpdateProfileCommand request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _updateProfileHandler.Handle(request, cancellationToken);

        return result.Match(
            success => Ok(success),
            errors => Problem(errors)
        );
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(Success), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteProfile(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteProfileCommand { Id = id };
        var result = await _deleteProfileHandler.Handle(command, cancellationToken);

        return result.Match(
            success => Ok(success),
            errors => Problem(errors)
        );
    }

    private IActionResult Problem(List<Error> errors)
    {
        if (errors.Count == 0) return Problem();

        if (errors.All(error => error.Type == ErrorType.Validation))
        {
            var modelStateDictionary = new ModelStateDictionary();
            foreach (var error in errors)
            {
                modelStateDictionary.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(modelStateDictionary);
        }

        var firstError = errors[0];

        var statusCode = firstError.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(statusCode: statusCode, title: firstError.Description);
    }
}
