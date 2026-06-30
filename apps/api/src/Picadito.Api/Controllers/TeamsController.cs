using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Teams.Commands.CreateTeam;
using Picadito.Application.Features.Teams.Commands.UpdateTeam;
using Picadito.Application.Features.Teams.Commands.DeleteTeam;
using Picadito.Application.Features.Teams.Queries.GetAllTeams;
using Picadito.Application.Features.Teams.Queries.GetTeamById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con los equipos deportivos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly CreateTeamHandler _createTeamHandler;
    private readonly UpdateTeamHandler _updateTeamHandler;
    private readonly DeleteTeamHandler _deleteTeamHandler;
    private readonly GetAllTeamsHandler _getAllTeamsHandler;
    private readonly GetTeamByIdHandler _getTeamByIdHandler;

    public TeamsController(
        CreateTeamHandler createTeamHandler,
        UpdateTeamHandler updateTeamHandler,
        DeleteTeamHandler deleteTeamHandler,
        GetAllTeamsHandler getAllTeamsHandler,
        GetTeamByIdHandler getTeamByIdHandler)
    {
        _createTeamHandler = createTeamHandler;
        _updateTeamHandler = updateTeamHandler;
        _deleteTeamHandler = deleteTeamHandler;
        _getAllTeamsHandler = getAllTeamsHandler;
        _getTeamByIdHandler = getTeamByIdHandler;
    }

    /// <summary>
    /// Obtiene todos los equipos con filtro opcional y paginación.
    /// Acceso público (sin autenticación).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<TeamDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllTeams(
        [FromQuery] GetAllTeamsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllTeamsHandler.Handle(query, cancellationToken);

        return result.Match(
            teams => Ok(teams),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Obtiene un equipo por su ID.
    /// Acceso público (sin autenticación).
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TeamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTeamById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetTeamByIdQuery { Id = id };
        var result = await _getTeamByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            team => Ok(team),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Crea un nuevo equipo.
    /// Requiere autenticación.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateTeam(
        [FromBody] CreateTeamCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createTeamHandler.Handle(command, cancellationToken);

        return result.Match(
            teamId => CreatedAtAction(nameof(GetTeamById), new { id = teamId }, new { id = teamId }),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Actualiza un equipo (PATCH).
    /// Solo el capitán del equipo o un administrador puede actualizarlo.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTeam(
        Guid id,
        [FromBody] UpdateTeamCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _updateTeamHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Elimina un equipo (Soft Delete).
    /// Solo el capitán del equipo o un administrador puede eliminarlo.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTeam(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteTeamCommand { Id = id };
        var result = await _deleteTeamHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Maneja los errores y los convierte a una respuesta HTTP apropiada.
    /// </summary>
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
