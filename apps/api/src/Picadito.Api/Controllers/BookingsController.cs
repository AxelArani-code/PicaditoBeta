using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using Picadito.Application.Features.Bookings.Queries.GetBookings;
using Picadito.Application.DTOs;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;

/// <summary>
/// Controlador para gestionar las operaciones relacionadas con las reservas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly CreateBookingHandler _createBookingHandler;
    private readonly GetBookingsHandler _getBookingsHandler;

    public BookingsController(
        CreateBookingHandler createBookingHandler,
        GetBookingsHandler getBookingsHandler)
    {
        _createBookingHandler = createBookingHandler;
        _getBookingsHandler = getBookingsHandler;
    }

    /// <summary>
    /// Obtiene todas las reservas con filtros opcionales.
    /// </summary>
    /// <param name="query">Filtros opcionales: Status, PaymentStatus, PitchId.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Lista de reservas o errores.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<BookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetBookings(
        [FromQuery] GetBookingsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _getBookingsHandler.Handle(query, cancellationToken);

        return result.Match(
            bookings => Ok(bookings),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Crea una nueva reserva.
    /// </summary>
    /// <param name="command">Datos de la reserva.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>ID de la reserva creada o errores.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateBooking(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _createBookingHandler.Handle(command, cancellationToken);

        return result.Match(
            bookingId => CreatedAtAction(nameof(GetBookingById), new { id = bookingId }, new { id = bookingId }),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Obtiene una reserva por su ID.
    /// </summary>
    /// <param name="id">ID de la reserva.</param>
    /// <returns>Reserva o error.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetBookingById(Guid id)
    {
        return Ok();
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
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(statusCode: statusCode, title: firstError.Description);
    }
}
