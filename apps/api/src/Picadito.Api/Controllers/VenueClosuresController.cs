using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.VenueClosures.Commands.CreateVenueClosure;
using Picadito.Application.Features.VenueClosures.Commands.DeleteVenueClosure;
using Picadito.Application.Features.VenueClosures.Queries.GetAllVenueClosures;
using Picadito.Application.Features.VenueClosures.Queries.GetVenueClosureById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VenueClosuresController : ControllerBase
{
    private readonly GetAllVenueClosuresHandler _getAllHandler;
    private readonly GetVenueClosureByIdHandler _getByIdHandler;
    private readonly CreateVenueClosureHandler _createHandler;
    private readonly DeleteVenueClosureHandler _deleteHandler;

    public VenueClosuresController(
        GetAllVenueClosuresHandler getAllHandler,
        GetVenueClosureByIdHandler getByIdHandler,
        CreateVenueClosureHandler createHandler,
        DeleteVenueClosureHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _createHandler = createHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<VenueClosureDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllVenueClosuresQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);

        return result.Match(
            closures => Ok(closures),
            errors => Problem(errors));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VenueClosureDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetVenueClosureByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            closure => Ok(closure),
            errors => Problem(errors));
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(
        [FromBody] CreateVenueClosureCommand request,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(request, cancellationToken);

        return result.Match(
            closureId => Ok(closureId),
            errors => Problem(errors));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(Success), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteVenueClosureCommand { Id = id };
        var result = await _deleteHandler.Handle(command, cancellationToken);

        return result.Match(
            success => Ok(success),
            errors => Problem(errors));
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
