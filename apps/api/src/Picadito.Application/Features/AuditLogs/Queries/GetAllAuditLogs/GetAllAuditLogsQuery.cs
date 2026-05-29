using System;

namespace Picadito.Application.Features.AuditLogs.Queries.GetAllAuditLogs;

/// <summary>
/// Query para obtener todos los registros de auditoría con filtros y paginación.
/// </summary>
public class GetAllAuditLogsQuery
{
    public string? Action { get; set; }
    public string? Entity { get; set; }
    public string? EntityId { get; set; }
    public Guid? UserId { get; set; }

    /// <summary>
    /// Número de página a solicitar (comienza en 1). Por defecto: 1.
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Cantidad de elementos por página. Por defecto: 20.
    /// </summary>
    public int PageSize { get; set; } = 20;
}
