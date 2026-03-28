using Microsoft.AspNetCore.Mvc;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;

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
        var bookingId = await _createBookingHandler.Handle(command, cancellationToken);
        return CreatedAtAction(nameof(GetBookingById), new { id = bookingId }, new { id = bookingId });
    }

    [HttpGet("{id}")]
    public IActionResult GetBookingById(Guid id)
    {
        // Aquí iría la lógica para obtener una reserva por su ID.
        return Ok();
    }
}
