using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Matches.Commands.CreateMatch;

/// <summary>
/// Manejador para la creación de un Match.
/// Valida permisos, existencia de la reserva, y que no haya un match duplicado.
/// Nota: Normalmente los partidos se crean automáticamente por un trigger en la BD
/// al confirmar una reserva. Este endpoint permite creación manual para administradores.
/// </summary>
public class CreateMatchHandler(
    IMatchRepository matchRepository,
    IValidator<CreateMatchCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateMatchHandler> logger)
{
    public async Task<ErrorOr<Guid>> Handle(CreateMatchCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            logger.LogInformation(
                "Iniciando creación de Match para BookingId: {BookingId}, VenueId: {VenueId}",
                request.BookingId, request.VenueId);

            // 1. Validación del comando con FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("Validación fallida. Errors: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error =>
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // 2. Verificar autenticación
            if (currentUserService.UserId is null)
            {
                logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            // 3. Solo venue_owner y admin pueden crear partidos manualmente
            if (userRole == UserRole.player)
            {
                logger.LogWarning("Player role no autorizado para crear partidos. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear partidos.");
            }

            // 4. Parsear fecha
            if (!DateOnly.TryParse(request.Date, out var date))
            {
                logger.LogWarning("Formato de fecha inválido: {Date}", request.Date);
                return Error.Validation("Date", "La fecha no tiene un formato válido.");
            }

            // 5. Verificar que la reserva existe y está confirmada
            var bookingConfirmed = await matchRepository.BookingExistsAndIsConfirmedAsync(
                request.BookingId, cancellationToken);
            if (!bookingConfirmed)
            {
                logger.LogWarning(
                    "La reserva no existe o no está confirmada. BookingId: {BookingId}",
                    request.BookingId);
                return DomainErrors.Match.BookingNotConfirmed;
            }

            // 6. Verificar que la reserva no tenga ya un match asociado
            var alreadyHasMatch = await matchRepository.BookingAlreadyHasMatchAsync(
                request.BookingId, cancellationToken);
            if (alreadyHasMatch)
            {
                logger.LogWarning(
                    "La reserva ya tiene un partido. BookingId: {BookingId}",
                    request.BookingId);
                return DomainErrors.Match.BookingAlreadyHasMatch;
            }

            // 7. Verificar propiedad del venue (solo si no es admin)
            if (!isAdmin)
            {
                var isVenueOwner = await matchRepository.IsVenueOwnerAsync(
                    request.VenueId, userId, cancellationToken);
                if (!isVenueOwner)
                {
                    logger.LogWarning(
                        "El usuario no es dueño del complejo. UserId: {UserId}, VenueId: {VenueId}",
                        userId, request.VenueId);
                    return DomainErrors.Match.VenueForbidden;
                }
            }

            // 8. Crear la entidad de dominio
            var match = new Match(
                request.BookingId,
                request.VenueId,
                date);

            // 9. Persistir
            var result = await matchRepository.AddAsync(match, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            logger.LogInformation(
                "Match creado exitosamente. MatchId: {MatchId}, BookingId: {BookingId}, VenueId: {VenueId}",
                result.Value, match.BookingId, match.VenueId);

            return result.Value;
        }
    }
}
