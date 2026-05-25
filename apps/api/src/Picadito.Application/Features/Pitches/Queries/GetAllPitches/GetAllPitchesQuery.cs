namespace Picadito.Application.Features.Pitches.Queries.GetAllPitches;

/// <summary>
/// Query para obtener todas las canchas con filtros y paginación.
/// </summary>
public class GetAllPitchesQuery
{
    // Propiedades opcionales para filtrado
    public Guid? VenueId { get; init; }
    public string? Type { get; init; }
    public string? Surface { get; init; }
    
    /// <summary>
    /// Número de página a solicitar (comienza en 1). Por defecto: 1.
    /// </summary>
    public int PageNumber { get; init; } = 1;
    
    /// <summary>
    /// Cantidad de elementos por página. Por defecto: 20.
    /// </summary>
    public int PageSize { get; init; } = 20;
}
