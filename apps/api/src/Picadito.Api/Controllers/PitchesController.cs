using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Picadito.Application.Features.Pitches.Commands.CreatePitch;
using Picadito.Application.Features.Pitches.Queries.GetAllPitches;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con las canchas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PitchesController : ControllerBase
{
    private readonly GetAllPitchesHandler _getAllPitchesHandler;
    private readonly CreatePitchHandler _createPitchHandler;

    public PitchesController(
        GetAllPitchesHandler getAllPitchesHandler,
        CreatePitchHandler createPitchHandler)
    {
        _getAllPitchesHandler = getAllPitchesHandler;
        _createPitchHandler = createPitchHandler;
    }

    /// <summary>
    /// Obtiene todas las canchas con filtros opcionales y paginación.
    /// Los usuarios ven canchas activas, los dueños ven todas las de sus locales.
    /// </summary>
    /// <param name="query">Filtros opcionales: VenueId, Type, Surface, PageNumber, PageSize.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con las canchas.</returns>
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

    /// <summary>
    /// Crea una nueva cancha en un complejo deportivo.
    /// Requiere autenticación. Solo admins y venue_owners pueden crear canchas.
    /// Los admins pueden asignar cualquier VenueId; los owners solo pueden crear en sus propios complejos.
    /// </summary>
    /// <param name="request">Datos de la cancha a crear.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>El ID de la cancha creada.</returns>
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

    /// <summary>
    /// Maneja los errores y los convierte a una respuesta HTTP apropiada.
    /// </summary>
    private IActionResult Problem(List<Error> errors)
    {
        if (errors.Count == 0) return Problem();

        // Si todos los errores son de validación, devolvemos un 400 con los detalles
        if (errors.All(error => error.Type == ErrorType.Validation))
        {
            var modelStateDictionary = new ModelStateDictionary();
            foreach (var error in errors)
            {
                modelStateDictionary.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(modelStateDictionary);
        }

        // Si hay errores de distintos tipos, tomamos el primero para decidir el StatusCode
        var firstError = errors[0];
        
        var statusCode = firstError.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(statusCode: statusCode, title: firstError.Description);
    }
}
