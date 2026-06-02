using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.AuditLogs.Queries.GetAllAuditLogs;

/// <summary>
/// Handler para obtener todos los registros de auditoría con paginación.
/// </summary>
public class GetAllAuditLogsHandler(
    IAuditLogRepository auditLogRepository,
    IValidator<GetAllAuditLogsQuery> validator,
    ILogger<GetAllAuditLogsHandler> logger)
{
    private readonly ILogger<GetAllAuditLogsHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<AuditLogDto>>> Handle(GetAllAuditLogsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllAuditLogs requested: Action={Action}, Entity={Entity}, EntityId={EntityId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.Action, request.Entity, request.EntityId, request.UserId, request.PageNumber, request.PageSize);

        // Validación usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Consulta al repositorio con paginación
        var result = await auditLogRepository.GetAllAsync(
            request.Action,
            request.Entity,
            request.EntityId,
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllAuditLogs completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}, TotalPages={TotalPages}",
            result.Value.PageNumber,
            result.Value.PageSize,
            result.Value.Items.Count,
            result.Value.TotalCount,
            result.Value.TotalPages);

        return result.Value;
    }
}
