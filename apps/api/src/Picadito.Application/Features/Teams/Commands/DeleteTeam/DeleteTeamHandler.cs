using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.Teams.Commands.DeleteTeam;

/// <summary>
/// Handler para el comando de eliminar un equipo (Soft Delete).
/// </summary>
public class DeleteTeamHandler(
    ITeamRepository teamRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteTeamHandler> logger)
{
    private readonly ILogger<DeleteTeamHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TeamId: {TeamId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting team soft delete for TeamId: {TeamId}", request.Id);

            if (currentUserService.UserId is null)
            {
                _logger.LogWarning("Intento de acceso de usuario no autenticado.");
                return Error.Unauthorized(description: "Usuario no autenticado");
            }

            var userId = currentUserService.UserId.Value;

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            // Validación de negocio: verificar que el equipo existe
            var team = await teamRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (team == null)
            {
                _logger.LogWarning("Team not found. TeamId: {TeamId}", request.Id);
                return DomainErrors.Team.NotFound;
            }

            // Verificar permisos según la política RLS "Admins y Captain can manage team"
            if (!isAdmin && team.CaptainId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized delete attempt. UserId: {UserId}, TeamCaptainId: {TeamCaptainId}, TeamId: {TeamId}",
                    userId, team.CaptainId, request.Id);
                return DomainErrors.Team.Forbidden;
            }

            // Soft delete
            await teamRepository.DeleteAsync(request.Id, cancellationToken);

            _logger.LogInformation(
                "Team soft deleted successfully. TeamId: {TeamId}, Name: {Name}",
                team.Id, team.Name);

            return Result.Success;
        }
    }
}
