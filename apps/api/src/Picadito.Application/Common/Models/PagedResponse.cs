using System.Collections.Generic;

namespace Picadito.Application.Common.Models;

/// <summary>
/// Representa una respuesta paginada genérica.
/// Contiene los elementos de la página actual junto con la información de paginación.
/// </summary>
/// <typeparam name="T">Tipo de los elementos contenidos.</typeparam>
public record PagedResponse<T>(
    List<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages);
