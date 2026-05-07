using System;

namespace Picadito.Application.Features.Venues.Queries.GetAllVenues;

/// <summary>
/// Query para obtener todos los complejos deportivos con filtros y paginación.
/// </summary>
public class GetAllVenuesQuery
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public bool? IsActive { get; set; }
    
    /// <summary>
    /// Número de página a solicitar (comienza en 1). Por defecto: 1.
    /// </summary>
    public int PageNumber { get; set; } = 1;
    
    /// <summary>
    /// Cantidad de elementos por página. Por defecto: 20.
    /// </summary>
    public int PageSize { get; set; } = 20;
}