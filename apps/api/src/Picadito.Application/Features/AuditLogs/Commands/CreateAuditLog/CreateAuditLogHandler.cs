using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.AuditLogs.Commands.CreateAuditLog;

/// <summary>
/// Handler para el comando de crear un nuevo registro de auditoría.
/// </summary>
public class CreateAuditLogHandler(
    IAuditLogRepository auditLogRepository,
    IValidator<CreateAuditLogCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateAuditLogHandler> logger)
{
    private readonly ILogger<CreateAuditLogHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateAuditLogCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Starting audit log creation for Action: {Action}, Entity: {Entity}, EntityId: {EntityId}",
                request.Action, request.Entity, request.EntityId);

            // Validación usando FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;
            var isAdmin = currentUserService.IsAdmin;

            // Determinar el UserId del registro según el rol
            Guid? auditUserId;
            if (isAdmin && request.UserId.HasValue)
            {
                // Admin puede registrar auditoría en nombre de otro usuario
                auditUserId = request.UserId.Value;
                _logger.LogInformation(
                    "Admin creating audit log. AdminId: {AdminId}, RecordedUserId: {RecordedUserId}",
                    userId, auditUserId);
            }
            else
            {
                // Usuario común: el UserId del registro debe ser el mismo que el autenticado
                auditUserId = userId;
            }

            // Crear la entidad
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = request.Action,
                Entity = request.Entity,
                EntityId = request.EntityId,
                UserId = auditUserId,
                CreatedAt = DateTime.UtcNow
            };

            // Persistir
            var result = await auditLogRepository.AddAsync(auditLog, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Audit log created successfully. AuditLogId: {AuditLogId}, Action: {Action}, Entity: {Entity}, EntityId: {EntityId}, UserId: {UserId}",
                result.Value, auditLog.Action, auditLog.Entity, auditLog.EntityId, auditLog.UserId);

            return result.Value;
        }
    }
}
