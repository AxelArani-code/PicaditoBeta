using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.VenueRatings.Commands.CreateVenueRating;
using Picadito.Application.Features.VenueRatings.Commands.DeleteVenueRating;
using Picadito.Application.Features.VenueRatings.Queries.GetAllVenueRatings;
using Picadito.Application.Features.VenueRatings.Queries.GetVenueRatingById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las calificaciones de los complejos deportivos.
/// </summary>
[ApiController]
[Route("api/venue-ratings")]
public class VenueRatingsController : ControllerBase
{
    private readonly CreateVenueRatingHandler _createHandler;
    private readonly DeleteVenueRatingHandler _deleteHandler;
    private readonly GetAllVenueRatingsHandler _getAllHandler;
    private readonly GetVenueRatingByIdHandler _getByIdHandler;

    public VenueRatingsController(
        CreateVenueRatingHandler createHandler,
        DeleteVenueRatingHandler deleteHandler,
        GetAllVenueRatingsHandler getAllHandler,
        GetVenueRatingByIdHandler getByIdHandler)
    {
        _createHandler = createHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
    }

    /// <summary>
    /// Obtiene todas las calificaciones con filtros opcionales y paginación.
    /// Acceso público.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<VenueRatingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetAllVenueRatingsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Obtiene una calificación por su ID.
    /// Acceso público.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VenueRatingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetVenueRatingByIdQuery { Id = id };
        var result = await _getByIdHandler.Handle(query, cancellationToken);
        return result.Match(Ok, errors => Problem(errors));
    }

    /// <summary>
    /// Crea una calificación para un complejo deportivo.
    /// Solo participantes del partido pueden calificar.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateVenueRatingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createHandler.Handle(command, cancellationToken);
        return result.Match(
            id => CreatedAtAction(nameof(GetById), new { id }, new { id }),
            errors => Problem(errors));
    }

    /// <summary>
    /// Elimina una calificación.
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
        var command = new DeleteVenueRatingCommand { Id = id };
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
