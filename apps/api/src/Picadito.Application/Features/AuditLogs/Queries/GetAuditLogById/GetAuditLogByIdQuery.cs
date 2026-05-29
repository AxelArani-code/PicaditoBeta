using System;

namespace Picadito.Application.Features.AuditLogs.Queries.GetAuditLogById;

/// <summary>
/// Query para obtener un registro de auditoría por su ID.
/// </summary>
public class GetAuditLogByIdQuery
{
    public Guid Id { get; set; }
}
