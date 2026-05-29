using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Infrastructure.Persistence.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationRepository> _logger;
    private static readonly TimeSpan SlowQueryThreshold = TimeSpan.FromMilliseconds(500);

    public NotificationRepository(ApplicationDbContext context, ILogger<NotificationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ErrorOr<Guid>> AddAsync(Notification notification, CancellationToken cancellationToken)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Notification created. NotificationId: {NotificationId}, UserId: {UserId}, Type: {Type}",
            notification.Id, notification.UserId, notification.Type);

        return notification.Id;
    }

    public async Task<ErrorOr<PagedResponse<NotificationDto>>> GetAllAsync(
        Guid userId,
        bool? isRead,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            IQueryable<Notification> query = _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId);

            if (isRead.HasValue)
            {
                query = query.Where(n => n.IsRead == isRead.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;

            var items = await query
                .OrderByDescending(n => n.CreatedAt)
                .ThenBy(n => n.Id)
                .Skip(skip)
                .Take(pageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    UserId = n.UserId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    Link = n.Link,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetAllNotificationsAsync: ElapsedMs={ElapsedMs}, UserId={UserId}, IsRead={IsRead}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}",
                    elapsedMs, userId, isRead, pageNumber, pageSize, items.Count);
            }
            else
            {
                _logger.LogInformation(
                    "GetAllNotificationsAsync completed: ElapsedMs={ElapsedMs}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}, Count={Count}, TotalCount={TotalCount}",
                    elapsedMs, userId, pageNumber, pageSize, items.Count, totalCount);
            }

            return new PagedResponse<NotificationDto>(
                Items: items,
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
                "GetAllNotificationsAsync error: ElapsedMs={ElapsedMs}, UserId={UserId}",
                sw.ElapsedMilliseconds, userId);
            throw;
        }
    }

    public async Task<NotificationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var notification = await _context.Notifications
                .AsNoTracking()
                .Where(n => n.Id == id)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    UserId = n.UserId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead,
                    Link = n.Link,
                    CreatedAt = n.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (sw.Elapsed >= SlowQueryThreshold)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetNotificationByIdAsync: ElapsedMs={ElapsedMs}, NotificationId={NotificationId}",
                    elapsedMs, id);
            }
            else
            {
                _logger.LogInformation(
                    "GetNotificationByIdAsync completed: ElapsedMs={ElapsedMs}, NotificationId={NotificationId}, Found={Found}",
                    elapsedMs, id, notification != null);
            }

            return notification;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(
                ex,
                "GetNotificationByIdAsync error: ElapsedMs={ElapsedMs}, NotificationId={NotificationId}",
                sw.ElapsedMilliseconds, id);
            throw;
        }
    }

    public async Task<Notification?> GetEntityByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<ErrorOr<Success>> UpdateAsync(Notification notification, CancellationToken cancellationToken)
    {
        _context.Notifications.Update(notification);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Notification updated. NotificationId: {NotificationId}, IsRead: {IsRead}",
            notification.Id, notification.IsRead);

        return Result.Success;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
