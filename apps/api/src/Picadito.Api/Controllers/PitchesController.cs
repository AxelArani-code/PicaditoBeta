using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.Pitches.Commands.CreatePitch;
using Picadito.Application.Features.Pitches.Commands.UpdatePitch;
using Picadito.Application.Features.Pitches.Commands.DeletePitch;
using Picadito.Application.Features.Pitches.Queries.GetAllPitches;
using Picadito.Application.Features.Pitches.Queries.GetPitchById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PitchesController : ControllerBase
{
    private readonly GetAllPitchesHandler _getAllPitchesHandler;
    private readonly GetPitchByIdHandler _getPitchByIdHandler;
    private readonly CreatePitchHandler _createPitchHandler;
    private readonly UpdatePitchHandler _updatePitchHandler;
    private readonly DeletePitchHandler _deletePitchHandler;

    public PitchesController(
        GetAllPitchesHandler getAllPitchesHandler,
        GetPitchByIdHandler getPitchByIdHandler,
        CreatePitchHandler createPitchHandler,
        UpdatePitchHandler updatePitchHandler,
        DeletePitchHandler deletePitchHandler)
    {
        _getAllPitchesHandler = getAllPitchesHandler;
        _getPitchByIdHandler = getPitchByIdHandler;
        _createPitchHandler = createPitchHandler;
        _updatePitchHandler = updatePitchHandler;
        _deletePitchHandler = deletePitchHandler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<PitchDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllPitches(
        [FromQuery] GetAllPitchesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllPitchesHandler.Handle(query, cancellationToken);

        return result.Match(
            pitches => Ok(pitches),
            errors => Problem(errors)
        );
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PitchDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPitchById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetPitchByIdQuery { Id = id };
        var result = await _getPitchByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            pitch => Ok(pitch),
            errors => Problem(errors)
        );
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreatePitch(
        [FromBody] CreatePitchCommand request,
        CancellationToken cancellationToken)
    {
        var result = await _createPitchHandler.Handle(request, cancellationToken);

        return result.Match(
            pitchId => Ok(pitchId),
            errors => Problem(errors)
        );
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Success), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePitch(
        Guid id,
        [FromBody] UpdatePitchCommand request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _updatePitchHandler.Handle(request, cancellationToken);

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
    public async Task<IActionResult> DeletePitch(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeletePitchCommand { Id = id };
        var result = await _deletePitchHandler.Handle(command, cancellationToken);

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
