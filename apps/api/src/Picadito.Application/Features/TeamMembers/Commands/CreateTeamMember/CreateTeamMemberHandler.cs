using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.TeamMembers.Commands.CreateTeamMember;

/// <summary>
/// Handler para agregar un miembro a un equipo.
/// La política RLS permite al capitán agregar miembros y a los usuarios agregarse a sí mismos.
/// </summary>
public class CreateTeamMemberHandler(
    ITeamMemberRepository teamMemberRepository,
    ITeamRepository teamRepository,
    IValidator<CreateTeamMemberCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateTeamMemberHandler> logger)
{
    private readonly ILogger<CreateTeamMemberHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Adding member to team. TeamId: {TeamId}, UserId: {UserId}", request.TeamId, request.UserId);

            // Validación de formato usando FluentValidation
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

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;

            // Validar que el equipo existe
            var team = await teamRepository.GetEntityByIdAsync(request.TeamId, cancellationToken);
            if (team == null)
            {
                _logger.LogWarning("Team not found. TeamId: {TeamId}", request.TeamId);
                return DomainErrors.Team.NotFound;
            }

            // Verificar permisos según la política RLS:
            // - Admin: bypass total
            // - Capitán del equipo: puede agregar cualquier miembro
            // - Usuario regular: solo puede agregarse a sí mismo
            var isCaptain = await teamRepository.IsCaptainAsync(request.TeamId, userId, cancellationToken);
            var isSelf = request.UserId == userId;

            if (!isAdmin && !isCaptain && !isSelf)
            {
                _logger.LogWarning(
                    "Unauthorized attempt to add member. UserId: {UserId}, TargetUserId: {TargetUserId}, TeamId: {TeamId}",
                    userId, request.UserId, request.TeamId);
                return DomainErrors.TeamMember.Forbidden;
            }

            // Verificar que el usuario objetivo no sea ya miembro del equipo
            var alreadyMember = await teamMemberRepository.IsMemberAsync(request.TeamId, request.UserId, cancellationToken);
            if (alreadyMember)
            {
                _logger.LogWarning("User is already a member. TeamId: {TeamId}, UserId: {UserId}", request.TeamId, request.UserId);
                return DomainErrors.TeamMember.AlreadyMember;
            }

            // Determinar el rol del nuevo miembro
            // Solo admin o capitán pueden asignar 'captain'; los usuarios comunes siempre son 'player'
            string memberRole;
            if (!string.IsNullOrEmpty(request.Role) && (isAdmin || isCaptain))
            {
                memberRole = request.Role;
            }
            else
            {
                memberRole = "player";
            }

            // Crear la entidad TeamMember
            var member = new TeamMember
            {
                Id = Guid.NewGuid(),
                TeamId = request.TeamId,
                UserId = request.UserId,
                Role = memberRole,
                JoinedAt = DateTime.UtcNow
            };

            // Persistir
            var result = await teamMemberRepository.AddAsync(member, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Member added successfully. TeamMemberId: {TeamMemberId}, TeamId: {TeamId}, UserId: {UserId}, Role: {Role}",
                result.Value, member.TeamId, member.UserId, member.Role);

            return result.Value;
        }
    }
}
