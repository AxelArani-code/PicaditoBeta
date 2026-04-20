using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using Picadito.Application.Features.Bookings.Commands.ConfirmBooking;
using Picadito.Application.Features.Bookings.Commands.RejectBooking;
using Picadito.Application.Features.Bookings.Commands.CancelBooking;
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
    private readonly ConfirmBookingHandler _confirmBookingHandler;
    private readonly RejectBookingHandler _rejectBookingHandler;
    private readonly CancelBookingHandler _cancelBookingHandler;

    public BookingsController(
        CreateBookingHandler createBookingHandler,
        GetBookingsHandler getBookingsHandler,
        ConfirmBookingHandler confirmBookingHandler,
        RejectBookingHandler rejectBookingHandler,
        CancelBookingHandler cancelBookingHandler)
    {
        _createBookingHandler = createBookingHandler;
        _getBookingsHandler = getBookingsHandler;
        _confirmBookingHandler = confirmBookingHandler;
        _rejectBookingHandler = rejectBookingHandler;
        _cancelBookingHandler = cancelBookingHandler;
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
    /// Confirma una reserva pendiente.
    /// Solo puede ser llamado por el propietario del complejo (venue_owner).
    /// </summary>
    /// <param name="id">ID de la reserva a confirmar.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>204 No Content en éxito.</returns>
    /// <remarks>
    /// Al confirmar la reserva:
    /// - El trigger 'booking_status_changed' marca el TimeSlot como 'booked'.
    /// - Se crea automáticamente un Match para el partido.
    /// - Se envía una notificación al jugador.
    /// </remarks>
    [HttpPatch("{id:guid}/confirm")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ConfirmBooking(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new ConfirmBookingCommand { Id = id };
        var result = await _confirmBookingHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Rechaza una reserva pendiente.
    /// Solo puede ser llamado por el propietario del complejo (venue_owner).
    /// </summary>
    /// <param name="id">ID de la reserva a rechazar.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>204 No Content en éxito.</returns>
    /// <remarks>
    /// Al rechazar la reserva:
    /// - El trigger 'booking_status_changed' marca el TimeSlot como 'available'.
    /// - Se envía una notificación al jugador indicando el rechazo.
    /// </remarks>
    [HttpPatch("{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RejectBooking(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new RejectBookingCommand { Id = id };
        var result = await _rejectBookingHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Cancela una reserva confirmada.
    /// Solo puede ser llamado por el propietario del complejo (venue_owner).
    /// </summary>
    /// <param name="id">ID de la reserva a cancelar.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>204 No Content en éxito.</returns>
    /// <remarks>
    /// Al cancelar la reserva:
    /// - El trigger 'booking_status_changed' marca el TimeSlot como 'available'.
    /// - Se marca el Match como cancelado.
    /// - Se envía una notificación al jugador indicando la cancelación.
    /// </remarks>
    [HttpPatch("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelBooking(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new CancelBookingCommand { Id = id };
        var result = await _cancelBookingHandler.Handle(command, cancellationToken);

        return result.Match(
            _ => NoContent(),
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
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(statusCode: statusCode, title: firstError.Description);
    }
}
