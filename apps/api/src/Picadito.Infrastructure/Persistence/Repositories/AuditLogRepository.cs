using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

/// <summary>
/// Implementación del repositorio de registros de auditoría usando EF Core.
/// </summary>
public class AuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuditLogRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public AuditLogRepository(ApplicationDbContext context, ILogger<AuditLogRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(AuditLog auditLog, CancellationToken cancellationToken)
    {
        await _context.AuditLogs.AddAsync(auditLog, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "AuditLog created successfully. AuditLogId: {AuditLogId}, Action: {Action}, Entity: {Entity}, EntityId: {EntityId}, UserId: {UserId}",
            auditLog.Id, auditLog.Action, auditLog.Entity, auditLog.EntityId, auditLog.UserId);

        return auditLog.Id;
    }

    public async Task<ErrorOr<PagedResponse<AuditLogDto>>> GetAllAsync(
        string? action,
        string? entity,
        string? entityId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            IQueryable<AuditLog> query = _context.AuditLogs
                .AsNoTracking()
                .Include(a => a.User);

            // Aplicar filtros opcionales
            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action.ToLower().Contains(action.ToLower()));
            }

            if (!string.IsNullOrEmpty(entity))
            {
                query = query.Where(a => a.Entity.ToLower().Contains(entity.ToLower()));
            }

            if (!string.IsNullOrEmpty(entityId))
            {
                query = query.Where(a => a.EntityId.Contains(entityId));
            }

            if (userId.HasValue)
            {
                query = query.Where(a => a.UserId == userId.Value);
            }

            // Obtener el conteo total de registros que coinciden con los filtros
            var totalCount = await query.CountAsync(cancellationToken);

            // Calcular el total de páginas basado en el tamaño de página
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Calcular el salto (skip) basado en la página actual
            var skip = (pageNumber - 1) * pageSize;

            // Aplicar ordenamiento por fecha de creación descendente
            var auditLogs = await query
                .OrderByDescending(a => a.CreatedAt)
                .ThenBy(a => a.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.User != null ? a.User.FullName : null,
                    Action = a.Action,
                    Entity = a.Entity,
                    EntityId = a.EntityId,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllAsync (paginated): ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Action={Action}, Entity={Entity}, EntityId={EntityId}, UserId={UserId}, Count={Count}",
                    elapsedMs, pageNumber, pageSize, action, entity, entityId, userId, auditLogs.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllAsync (paginated) completed: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, pageNumber, pageSize, auditLogs.Count, totalCount);
            }

            return new PagedResponse<AuditLogDto>(
                Items: auditLogs,
                PageNumber: pageNumber,
                PageSize: pageSize,
                TotalCount: totalCount,
                TotalPages: totalPages);
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetAllAsync error: ElapsedMs={ElapsedMs}, PageNumber={PageNumber}, PageSize={PageSize}, Action={Action}, Entity={Entity}, EntityId={EntityId}, UserId={UserId}",
                sw.ElapsedMilliseconds, pageNumber, pageSize, action, entity, entityId, userId);
            throw;
        }
    }

    public async Task<AuditLogDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var auditLog = await _context.AuditLogs
                .AsNoTracking()
                .Include(a => a.User)
                .Where(a => a.Id == id)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.User != null ? a.User.FullName : null,
                    Action = a.Action,
                    Entity = a.Entity,
                    EntityId = a.EntityId,
                    CreatedAt = a.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetByIdAsync: ElapsedMs={ElapsedMs}, AuditLogId={AuditLogId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetByIdAsync completed: ElapsedMs={ElapsedMs}, AuditLogId={AuditLogId}, Found={Found}",
                    elapsedMs, id, auditLog != null);
            }

            return auditLog;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetByIdAsync error: ElapsedMs={ElapsedMs}, AuditLogId={AuditLogId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<AuditLog?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.AuditLogs
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }
}
