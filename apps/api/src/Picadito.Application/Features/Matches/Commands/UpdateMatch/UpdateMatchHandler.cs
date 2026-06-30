using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.Matches.Commands.UpdateMatch;

/// <summary>
/// Manejador para la actualización parcial de un Match.
/// Permite actualizar marcadores y/o estado del partido.
/// </summary>
public class UpdateMatchHandler(
    IMatchRepository matchRepository,
    IValidator<UpdateMatchCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateMatchHandler> logger)
{
    public async Task<ErrorOr<Success>> Handle(UpdateMatchCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (logger.BeginScope("CorrelationId: {CorrelationId}, MatchId: {MatchId}", correlationId, request.Id))
        {
            logger.LogInformation("Iniciando actualización de Match. MatchId: {MatchId}", request.Id);

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

            // 3. Verificar que el partido existe
            var match = await matchRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (match is null)
            {
                logger.LogWarning("Match no encontrado. MatchId: {MatchId}", request.Id);
                return DomainErrors.Match.NotFound;
            }

            // 4. Autorización basada en el rol del usuario, reflejando las políticas RLS de la BD
            //    RLS: "Venue owners and match players can update match"
            if (!isAdmin)
            {
                if (userRole == UserRole.venue_owner)
                {
                    // El venue_owner solo puede modificar partidos de sus propios complejos
                    if (match.Venue.OwnerId != userId)
                    {
                        logger.LogWarning(
                            "El venue_owner no es dueño del complejo del partido. UserId: {UserId}, MatchId: {MatchId}",
                            userId, request.Id);
                        return DomainErrors.Match.VenueForbidden;
                    }
                }
                else if (userRole == UserRole.player)
                {
                    // El player solo puede modificar partidos donde participa como jugador
                    var isParticipant = match.MatchPlayers.Any(mp => mp.UserId == userId);
                    if (!isParticipant)
                    {
                        logger.LogWarning(
                            "El player no participa en este partido. UserId: {UserId}, MatchId: {MatchId}",
                            userId, request.Id);
                        return DomainErrors.Match.Forbidden;
                    }

                    // Los players no pueden cancelar partidos, solo actualizar marcadores o marcar como jugado
                    if (!string.IsNullOrEmpty(request.Status) &&
                        request.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase))
                    {
                        logger.LogWarning(
                            "Player no autorizado para cancelar partidos. UserId: {UserId}, MatchId: {MatchId}",
                            userId, request.Id);
                        return Error.Forbidden(
                            "Match.PlayerCannotCancel",
                            "Los jugadores no pueden cancelar partidos.");
                    }
                }
                else
                {
                    // Roles no reconocidos sin permisos de actualización
                    logger.LogWarning(
                        "Rol sin permisos para actualizar partidos. UserId: {UserId}, Role: {Role}", userId, userRole);
                    return Error.Forbidden(description: "No tienes permisos para actualizar este partido.");
                }
            }

            bool hasChanges = false;

            // 6. Actualizar marcadores si se proporcionaron ambos
            if (request.HomeScore.HasValue && request.AwayScore.HasValue)
            {
                match.SetScore(request.HomeScore.Value, request.AwayScore.Value);
                logger.LogInformation(
                    "Marcadores actualizados. MatchId: {MatchId}, HomeScore: {HomeScore}, AwayScore: {AwayScore}",
                    request.Id, request.HomeScore.Value, request.AwayScore.Value);
                hasChanges = true;
            }

            // 7. Actualizar estado si se proporcionó
            if (!string.IsNullOrEmpty(request.Status))
            {
                var statusLower = request.Status.ToLowerInvariant();

                if (statusLower == "played")
                {
                    match.MarkAsPlayed();
                    logger.LogInformation("Match marcado como jugado. MatchId: {MatchId}", request.Id);
                }
                else if (statusLower == "cancelled")
                {
                    match.Cancel();
                    logger.LogInformation("Match cancelado. MatchId: {MatchId}", request.Id);
                }

                hasChanges = true;
            }

            if (!hasChanges)
            {
                logger.LogWarning("No se especificaron cambios para aplicar. MatchId: {MatchId}", request.Id);
                return Error.Validation("NoChanges", "No se especificaron cambios para aplicar.");
            }

            // 8. Persistir
            var result = await matchRepository.UpdateAsync(match, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            logger.LogInformation(
                "Match actualizado exitosamente. MatchId: {MatchId}", request.Id);

            return Result.Success;
        }
    }
}
