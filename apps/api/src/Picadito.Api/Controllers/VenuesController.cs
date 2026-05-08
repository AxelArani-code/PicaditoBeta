using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Venues.Commands.CreateVenue;
using Picadito.Application.Features.Venues.Commands.UpdateVenue;
using Picadito.Application.Features.Venues.Commands.DeleteVenue;
using Picadito.Application.Features.Venues.Queries.GetAllVenues;
using Picadito.Application.Features.Venues.Queries.GetVenueById;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con los complejos deportivos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class VenuesController : ControllerBase
{
    private readonly CreateVenueHandler _createVenueHandler;
    private readonly UpdateVenueHandler _updateVenueHandler;
    private readonly DeleteVenueHandler _deleteVenueHandler;
    private readonly GetAllVenuesHandler _getAllVenuesHandler;
    private readonly GetVenueByIdHandler _getVenueByIdHandler;

    public VenuesController(
        CreateVenueHandler createVenueHandler,
        UpdateVenueHandler updateVenueHandler,
        DeleteVenueHandler deleteVenueHandler,
        GetAllVenuesHandler getAllVenuesHandler,
        GetVenueByIdHandler getVenueByIdHandler)
    {
        _createVenueHandler = createVenueHandler;
        _updateVenueHandler = updateVenueHandler;
        _deleteVenueHandler = deleteVenueHandler;
        _getAllVenuesHandler = getAllVenuesHandler;
        _getVenueByIdHandler = getVenueByIdHandler;
    }

    /// <summary>
    /// Obtiene todos los complejos deportivos con filtros opcionales y paginación.
    /// Acceso público (sin autenticación).
    /// </summary>
    /// <param name="query">Filtros opcionales: Name, Address, IsActive, PageNumber, PageSize.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con los complejos deportivos.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<VenueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllVenues(
        [FromQuery] GetAllVenuesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getAllVenuesHandler.Handle(query, cancellationToken);

        return result.Match(
            venues => Ok(venues),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Obtiene un complejo deportivo por su ID.
    /// Acceso público (sin autenticación).
    /// </summary>
    /// <param name="id">ID del complejo deportivo.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Complejo deportivo o error.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VenueDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVenueById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetVenueByIdQuery { Id = id };
        var result = await _getVenueByIdHandler.Handle(query, cancellationToken);

        return result.Match(
            venue => Ok(venue),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Crea un nuevo complejo deportivo.
    /// Solo usuarios con rol venue_owner.
    /// </summary>
    /// <param name="command">Datos del complejo deportivo.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>ID del complejo creado o errores.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateVenue(
        [FromBody] CreateVenueCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createVenueHandler.Handle(command, cancellationToken);

        return result.Match(
            venueId => CreatedAtAction(nameof(GetVenueById), new { id = venueId }, new { id = venueId }),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Actualiza un complejo deportivo (PATCH).
    /// Solo el propietario del complejo puede actualizarlo.
    /// </summary>
    /// <param name="id">ID del complejo a actualizar.</param>
    /// <param name="command">Campos a actualizar.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>204 No Content en éxito.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVenue(
        Guid id,
        [FromBody] UpdateVenueCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        var result = await _updateVenueHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Elimina un complejo deportivo (Soft Delete).
    /// Solo el propietario del complejo puede eliminarlo.
    /// </summary>
    /// <param name="id">ID del complejo a eliminar.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>204 No Content en éxito.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVenue(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteVenueCommand { Id = id };
        var result = await _deleteVenueHandler.Handle(command, cancellationToken);

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