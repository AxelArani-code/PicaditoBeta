using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;
using Picadito.Domain.Enums;

namespace Picadito.Application.Features.TeamMembers.Commands.DeleteTeamMember;

/// <summary>
/// Handler para eliminar un miembro del equipo.
/// La política RLS permite al capitán eliminar cualquier miembro y al usuario su propio registro.
/// </summary>
public class DeleteTeamMemberHandler(
    ITeamMemberRepository teamMemberRepository,
    ITeamRepository teamRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteTeamMemberHandler> logger)
{
    private readonly ILogger<DeleteTeamMemberHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TeamMemberId: {TeamMemberId}", correlationId, request.Id))
        {
            _logger.LogInformation("Removing team member. TeamMemberId: {TeamMemberId}", request.Id);

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

            // Validar que el miembro existe
            var member = await teamMemberRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (member == null)
            {
                _logger.LogWarning("Team member not found. TeamMemberId: {TeamMemberId}", request.Id);
                return DomainErrors.TeamMember.NotFound;
            }

            // No permitir eliminar al capitán del equipo
            if (member.Role == "captain")
            {
                // Solo el admin puede eliminar al capitán (esto forzaría una transferencia posterior)
                if (!isAdmin)
                {
                    _logger.LogWarning(
                        "Attempt to remove captain. UserId: {UserId}, TeamMemberId: {TeamMemberId}",
                        userId, request.Id);
                    return DomainErrors.TeamMember.CannotRemoveCaptain;
                }
            }

            // Verificar permisos según la política RLS:
            // - Admin: bypass total
            // - Capitán del equipo: puede eliminar cualquier miembro
            // - Usuario regular: solo puede eliminar su propio registro
            var isCaptain = await teamRepository.IsCaptainAsync(member.TeamId, userId, cancellationToken);
            var isSelf = member.UserId == userId;

            if (!isAdmin && !isCaptain && !isSelf)
            {
                _logger.LogWarning(
                    "Unauthorized delete attempt. UserId: {UserId}, TeamMemberId: {TeamMemberId}",
                    userId, request.Id);
                return DomainErrors.TeamMember.Forbidden;
            }

            // Eliminar
            await teamMemberRepository.DeleteAsync(request.Id, cancellationToken);

            _logger.LogInformation(
                "Team member removed successfully. TeamMemberId: {TeamMemberId}, UserId: {UserId}",
                member.Id, member.UserId);

            return Result.Success;
        }
    }
}
