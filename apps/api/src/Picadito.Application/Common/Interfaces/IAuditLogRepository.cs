using System;
using Picadito.Domain.Entities;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using ErrorOr;

namespace Picadito.Application.Common.Interfaces;

/// <summary>
/// Contrato para el repositorio de registros de auditoría.
/// </summary>
public interface IAuditLogRepository
{
    /// <summary>
    /// Crea un nuevo registro de auditoría.
    /// </summary>
    /// <param name="auditLog">Entidad del registro a crear.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>El ID del registro creado o un error.</returns>
    Task<ErrorOr<Guid>> AddAsync(AuditLog auditLog, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene todos los registros de auditoría con filtros opcionales y paginación.
    /// </summary>
    /// <param name="action">Filtro por acción (parcial, case-insensitive).</param>
    /// <param name="entity">Filtro por entidad (parcial, case-insensitive).</param>
    /// <param name="entityId">Filtro por ID de entidad.</param>
    /// <param name="userId">Filtro por ID de usuario.</param>
    /// <param name="pageNumber">Número de página a obtener (comienza en 1).</param>
    /// <param name="pageSize">Cantidad de elementos por página.</param>
    /// <param name="cancellationToken">Token de cancelación.</param>
    /// <returns>Respuesta paginada con los registros de auditoría.</returns>
    Task<ErrorOr<PagedResponse<AuditLogDto>>> GetAllAsync(
        string? action,
        string? entity,
        string? entityId,
        Guid? userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un registro de auditoría por su ID.
    /// </summary>
    Task<AuditLogDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Obtiene un registro de auditoría por su ID (entidad completa).
    /// </summary>
    Task<AuditLog?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken);
}
