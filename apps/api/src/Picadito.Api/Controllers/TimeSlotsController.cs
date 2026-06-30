using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.TimeSlots.Commands.CreateTimeSlot;
using Picadito.Application.Features.TimeSlots.Queries.GetAllTimeSlots;
using Picadito.Application.Features.TimeSlots.Queries.GetTimeSlotById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimeSlotsController : ControllerBase
{
    private readonly GetAllTimeSlotsHandler _getAllHandler;
    private readonly GetTimeSlotByIdHandler _getByIdHandler;
    private readonly CreateTimeSlotHandler _createHandler;

    public TimeSlotsController(
        GetAllTimeSlotsHandler getAllHandler,
        GetTimeSlotByIdHandler getByIdHandler,
        CreateTimeSlotHandler createHandler)
    {
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _createHandler = createHandler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<TimeSlotDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllTimeSlotsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);

        return result.Match(
            slots => Ok(slots),
            errors => Problem(errors));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TimeSlotDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetTimeSlotByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            slot => Ok(slot),
            errors => Problem(errors));
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateTimeSlotCommand request,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(request, cancellationToken);

        return result.Match(
            slotId => Ok(slotId),
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
