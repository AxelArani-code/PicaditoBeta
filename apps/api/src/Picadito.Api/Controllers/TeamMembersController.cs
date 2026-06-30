using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.TeamMembers.Commands.CreateTeamMember;
using Picadito.Application.Features.TeamMembers.Commands.UpdateTeamMember;
using Picadito.Application.Features.TeamMembers.Commands.DeleteTeamMember;
using Picadito.Application.Features.TeamMembers.Queries.GetAllTeamMembers;
using Picadito.Application.Features.TeamMembers.Queries.GetTeamMemberById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar los miembros de los equipos deportivos.
/// </summary>
[ApiController]
[Route("api/team-members")]
public class TeamMembersController : ControllerBase
{
    private readonly CreateTeamMemberHandler _createHandler;
    private readonly UpdateTeamMemberHandler _updateHandler;
    private readonly DeleteTeamMemberHandler _deleteHandler;
    private readonly GetAllTeamMembersHandler _getAllHandler;
    private readonly GetTeamMemberByIdHandler _getByIdHandler;

    public TeamMembersController(
        CreateTeamMemberHandler createHandler,
        UpdateTeamMemberHandler updateHandler,
        DeleteTeamMemberHandler deleteHandler,
        GetAllTeamMembersHandler getAllHandler,
        GetTeamMemberByIdHandler getByIdHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
    }

    /// <summary>
    /// Obtiene los miembros de equipo con filtros opcionales y paginación.
    /// Acceso público.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<TeamMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllTeamMembersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Obtiene un miembro del equipo por su ID.
    /// Acceso público.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetTeamMemberByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Agrega un miembro a un equipo.
    /// Requiere autenticación. El capitán puede agregar cualquier miembro;
    /// los usuarios solo pueden agregarse a sí mismos.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateTeamMemberCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(command, cancellationToken);
        return result.Match(
            id => CreatedAtAction(nameof(GetById), new { id }, new { id }),
            errors => Problem(errors));
    }

    /// <summary>
    /// Actualiza el rol de un miembro del equipo.
    /// Solo el capitán o un administrador puede cambiar roles.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateTeamMemberCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _updateHandler.Handle(command, cancellationToken);
        return result.Match(_ => NoContent(), errors => Problem(errors));
    }

    /// <summary>
    /// Elimina un miembro del equipo.
    /// El capitán puede eliminar cualquier miembro; los usuarios solo pueden eliminarse a sí mismos.
    /// El capitán no puede ser eliminado a menos que sea por un administrador.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteTeamMemberCommand { Id = id };
        var result = await _deleteHandler.Handle(command, cancellationToken);
        return result.Match(_ => NoContent(), errors => Problem(errors));
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
