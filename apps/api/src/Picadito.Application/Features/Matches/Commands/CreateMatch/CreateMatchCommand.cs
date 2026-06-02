namespace Picadito.Application.Features.Matches.Commands.CreateMatch;

/// <summary>
/// Comando para crear un nuevo partido asociado a una reserva confirmada.
/// </summary>
public class CreateMatchCommand
{
    public Guid BookingId { get; set; }
    public Guid VenueId { get; set; }
    public string Date { get; set; } = string.Empty;
}
