using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.AuditLogs.Commands.CreateAuditLog;
using Picadito.Application.Features.AuditLogs.Queries.GetAllAuditLogs;
using Picadito.Application.Features.AuditLogs.Queries.GetAuditLogById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con los registros de auditoría.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly CreateAuditLogHandler _createAuditLogHandler;
    private readonly GetAllAuditLogsHandler _getAllAuditLogsHandler;
    private readonly GetAuditLogByIdHandler _getAuditLogByIdHandler;

    public AuditLogsController(
        CreateAuditLogHandler createAuditLogHandler,
        GetAllAuditLogsHandler getAllAuditLogsHandler,
        GetAuditLogByIdHandler getAuditLogByIdHandler)
    {
        _createAuditLogHandler = createAuditLogHandler;
        _getAllAuditLogsHandler = getAllAuditLogsHandler;
        _getAuditLogByIdHandler = getAuditLogByIdHandler;
    }

    /// <summary>
    /// Obtiene todos los registros de auditoría con filtros opcionales y paginación.
    /// </summary>
    /// <param name="query">Filtros opcionales: Action, Entity, EntityId, UserId, PageNumber, PageSize.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con los registros de auditoría.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllAuditLogs(
        [FromQuery] GetAllAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllAuditLogsHandler.Handle(query, cancellationToken);

        return result.Match(
            auditLogs => Ok(auditLogs),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Obtiene un registro de auditoría por su ID.
    /// </summary>
    /// <param name="id">ID del registro de auditoría.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Registro de auditoría o error.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AuditLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLogById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetAuditLogByIdQuery { Id = id };
        var result = await _getAuditLogByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            auditLog => Ok(auditLog),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Crea un nuevo registro de auditoría.
    /// </summary>
    /// <param name="command">Datos del registro de auditoría.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>ID del registro creado o errores.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateAuditLog(
        [FromBody] CreateAuditLogCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createAuditLogHandler.Handle(command, cancellationToken);

        return result.Match(
            auditLogId => CreatedAtAction(nameof(GetAuditLogById), new { id = auditLogId }, new { id = auditLogId }),
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
