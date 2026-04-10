namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Query para obtener todas las canchas activas.
/// Esta clase representa la solicitud para listar canchas.
/// </summary>
public class GetAllPitchesQuery
{
    // Propiedades opcionales para filtrado (ej: por Venue, por tipo, etc.)
   
    public Guid? VenueId { get; init; }
    public string? Type { get; init; }
    public string? Surface { get; init; }
}
