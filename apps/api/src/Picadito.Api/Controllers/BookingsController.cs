using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using ErrorOr;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Picadito.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly CreateBookingHandler _createBookingHandler;

    public BookingsController(CreateBookingHandler createBookingHandler)
    {
        _createBookingHandler = createBookingHandler;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingCommand command, CancellationToken cancellationToken)
    {
        var result = await _createBookingHandler.Handle(command, cancellationToken);
        // Mapeamos el resultado a una respuesta HTTP
        return result.Match(
            bookingId => CreatedAtAction(nameof(GetBookingById), new { id = bookingId }, new { id = bookingId }),
            errors => Problem(errors)
        );
    }

    [HttpGet("{id}")]
    public IActionResult GetBookingById(Guid id)
    {
        // Aquí iría la lógica para obtener una reserva por su ID.
        return Ok();
    }

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
