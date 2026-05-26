using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.AvailabilityRules.Commands.CreateAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Commands.UpdateAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Commands.DeleteAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Queries.GetAllAvailabilityRules;
using Picadito.Application.Features.AvailabilityRules.Queries.GetAvailabilityRuleById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvailabilityRulesController : ControllerBase
{
    private readonly GetAllAvailabilityRulesHandler _getAllHandler;
    private readonly GetAvailabilityRuleByIdHandler _getByIdHandler;
    private readonly CreateAvailabilityRuleHandler _createHandler;
    private readonly UpdateAvailabilityRuleHandler _updateHandler;
    private readonly DeleteAvailabilityRuleHandler _deleteHandler;

    public AvailabilityRulesController(
        GetAllAvailabilityRulesHandler getAllHandler,
        GetAvailabilityRuleByIdHandler getByIdHandler,
        CreateAvailabilityRuleHandler createHandler,
        UpdateAvailabilityRuleHandler updateHandler,
        DeleteAvailabilityRuleHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AvailabilityRuleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllAvailabilityRulesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);

        return result.Match(
            rules => Ok(rules),
            errors => Problem(errors));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AvailabilityRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetAvailabilityRuleByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            rule => Ok(rule),
            errors => Problem(errors));
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(
        [FromBody] CreateAvailabilityRuleCommand request,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(request, cancellationToken);

        return result.Match(
            ruleId => Ok(ruleId),
            errors => Problem(errors));
    }

    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(Success), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateAvailabilityRuleCommand request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _updateHandler.Handle(request, cancellationToken);

        return result.Match(
            success => Ok(success),
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
        var command = new DeleteAvailabilityRuleCommand { Id = id };
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
