using System;

namespace Picadito.Application.Features.Teams.Queries.GetAllTeams;

/// <summary>
/// Query para obtener todos los equipos públicos con paginación y filtro opcional.
/// </summary>
public class GetAllTeamsQuery
{
    /// <summary>
    /// Filtro por nombre (búsqueda parcial, case-insensitive).
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Número de página a solicitar (comienza en 1). Por defecto: 1.
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Cantidad de elementos por página. Por defecto: 20.
    /// </summary>
    public int PageSize { get; set; } = 20;
}
