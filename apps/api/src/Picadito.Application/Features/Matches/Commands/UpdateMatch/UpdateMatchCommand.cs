namespace Picadito.Application.Features.Matches.Commands.UpdateMatch;

/// <summary>
/// Comando para actualizar parcialmente un partido (PATCH).
/// Todos los campos son opcionales para permitir actualizaciones parciales.
/// </summary>
public class UpdateMatchCommand
{
    public Guid Id { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }

    /// <summary>
    /// Estado al que se desea cambiar el partido: "played" o "cancelled".
    /// </summary>
    public string? Status { get; set; }
}
