using System;
using System.Diagnostics;
using System.Linq;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;
using ErrorOr;

namespace Picadito.Application.Features.Bookings.Queries.GetBookings;

/// <summary>
/// Handler para procesar GetBookingsQuery con paginación.
/// </summary>
public class GetBookingsHandler(
    IBookingRepository bookingRepository,
    IValidator<GetBookingsQuery> validator,
    ICurrentUserService currentUserService,
    ILogger<GetBookingsHandler> logger)
{
    private readonly ILogger<GetBookingsHandler> _logger = logger;
    
    public async Task<ErrorOr<PagedResponse<BookingDto>>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        if (currentUserService.UserId is null)
        {
            return Error.Unauthorized(description: "Usuario no autenticado.");
        }

        var userId = currentUserService.UserId.Value;

        if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
        {
            _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
            return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
        }

        _logger.LogInformation("GetBookings request started: UserId={UserId}, Role={Role}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}",
            userId, userRole, request.Status, request.PaymentStatus, request.PitchId, request.PageNumber, request.PageSize);

        try
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("GetBookings validation failed: UserId={UserId}, Errors={Errors}",
                    userId, string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error => 
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Calcular el valor de skip basado en la fórmula: (PageNumber - 1) * PageSize
            var skip = (request.PageNumber - 1) * request.PageSize;
            _logger.LogDebug("Calculated skip value: {Skip} for PageNumber: {PageNumber}, PageSize: {PageSize}",
                skip, request.PageNumber, request.PageSize);

            // Consulta al repositorio con paginación y filtros de seguridad por rol
            var result = await bookingRepository.GetAllAsync(
                userId,
                userRole,
                request.Status,
                request.PaymentStatus,
                request.PitchId,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            sw.Stop();
            var elapsedMs = sw.ElapsedMilliseconds;

            if (elapsedMs > 500)
            {
                _logger.LogWarning(
                    "[SLOW QUERY] GetBookings: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, Status={Status}, PaymentStatus={PaymentStatus}, PitchId={PitchId}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.Status, request.PaymentStatus, request.PitchId, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }
            else
            {
                _logger.LogInformation(
                    "GetBookings completed: ElapsedMs={ElapsedMs}, UserId={UserId}, Role={Role}, PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
                    elapsedMs, userId, userRole, request.PageNumber, request.PageSize, result.Value.Items.Count, result.Value.TotalCount);
            }

            return result.Value;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "GetBookings error: UserId={UserId}, ElapsedMs={ElapsedMs}",
                userId, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
