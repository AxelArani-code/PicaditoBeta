using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.AuditLogs.Queries.GetAuditLogById;

/// <summary>
/// Handler para obtener un registro de auditoría por su ID.
/// </summary>
public class GetAuditLogByIdHandler(
    IAuditLogRepository auditLogRepository,
    ILogger<GetAuditLogByIdHandler> logger)
{
    private readonly ILogger<GetAuditLogByIdHandler> _logger = logger;

    public async Task<ErrorOr<AuditLogDto>> Handle(GetAuditLogByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetAuditLogById requested: AuditLogId={AuditLogId}", request.Id);

        var auditLog = await auditLogRepository.GetByIdAsync(request.Id, cancellationToken);

        if (auditLog == null)
        {
            _logger.LogWarning("AuditLog not found. AuditLogId: {AuditLogId}", request.Id);
            return DomainErrors.AuditLog.NotFound;
        }

        _logger.LogInformation(
            "GetAuditLogById completed: AuditLogId={AuditLogId}, Action={Action}, Entity={Entity}",
            auditLog.Id, auditLog.Action, auditLog.Entity);

        return auditLog;
    }
}
