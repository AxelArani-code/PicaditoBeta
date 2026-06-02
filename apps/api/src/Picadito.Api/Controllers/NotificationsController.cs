using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Notifications.Commands.CreateNotification;
using Picadito.Application.Features.Notifications.Commands.UpdateNotification;
using Picadito.Application.Features.Notifications.Commands.DeleteNotification;
using Picadito.Application.Features.Notifications.Queries.GetAllNotifications;
using Picadito.Application.Features.Notifications.Queries.GetNotificationById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las notificaciones de los usuarios.
/// </summary>
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly CreateNotificationHandler _createHandler;
    private readonly UpdateNotificationHandler _updateHandler;
    private readonly DeleteNotificationHandler _deleteHandler;
    private readonly GetAllNotificationsHandler _getAllHandler;
    private readonly GetNotificationByIdHandler _getByIdHandler;

    public NotificationsController(
        CreateNotificationHandler createHandler,
        UpdateNotificationHandler updateHandler,
        DeleteNotificationHandler deleteHandler,
        GetAllNotificationsHandler getAllHandler,
        GetNotificationByIdHandler getByIdHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
    }

    /// <summary>
    /// Obtiene las notificaciones del usuario autenticado.
    /// Solo puede ver sus propias notificaciones (RLS).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<NotificationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Obtiene una notificación por su ID.
    /// Solo puede ver sus propias notificaciones (RLS).
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetNotificationByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Crea una notificación para un usuario.
    /// Solo administradores.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateNotificationCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(command, cancellationToken);
        return result.Match(
            id => CreatedAtAction(nameof(GetById), new { id }, new { id }),
            errors => Problem(errors));
    }

    /// <summary>
    /// Marca una notificación como leída/no leída.
    /// Solo el propietario de la notificación puede modificarla (RLS).
    /// </summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateNotificationCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _updateHandler.Handle(command, cancellationToken);
        return result.Match(_ => NoContent(), errors => Problem(errors));
    }

    /// <summary>
    /// Elimina una notificación.
    /// Solo administradores.
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
        var command = new DeleteNotificationCommand { Id = id };
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
