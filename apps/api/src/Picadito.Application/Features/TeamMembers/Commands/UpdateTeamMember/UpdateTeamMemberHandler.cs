using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.TeamMembers.Commands.UpdateTeamMember;

/// <summary>
/// Handler para actualizar el rol de un miembro del equipo.
/// La política RLS permite al capitán modificar cualquier miembro y al usuario su propio registro.
/// </summary>
public class UpdateTeamMemberHandler(
    ITeamMemberRepository teamMemberRepository,
    ITeamRepository teamRepository,
    IValidator<UpdateTeamMemberCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateTeamMemberHandler> logger)
{
    private readonly ILogger<UpdateTeamMemberHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TeamMemberId: {TeamMemberId}", correlationId, request.Id))
        {
            _logger.LogInformation("Updating team member. TeamMemberId: {TeamMemberId}", request.Id);

            // Validación de formato
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

            // Validar que el miembro existe
            var member = await teamMemberRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (member == null)
            {
                _logger.LogWarning("Team member not found. TeamMemberId: {TeamId}", request.Id);
                return DomainErrors.TeamMember.NotFound;
            }

            // Verificar permisos según la política RLS:
            // - Admin: bypass total
            // - Capitán del equipo: puede modificar cualquier miembro
            // - Usuario regular: solo puede modificar su propio registro
            var isCaptain = await teamRepository.IsCaptainAsync(member.TeamId, userId, cancellationToken);
            var isSelf = member.UserId == userId;

            if (!isAdmin && !isCaptain && !isSelf)
            {
                _logger.LogWarning(
                    "Unauthorized update attempt. UserId: {UserId}, TeamMemberId: {TeamMemberId}",
                    userId, request.Id);
                return DomainErrors.TeamMember.Forbidden;
            }

            // Si el usuario no es admin ni capitán, solo puede modificar su propio rol a 'player'
            if (!isAdmin && !isCaptain && request.Role != null)
            {
                _logger.LogWarning(
                    "Non-captain user attempted to change role. UserId: {UserId}, TeamMemberId: {TeamMemberId}",
                    userId, request.Id);
                return DomainErrors.TeamMember.Forbidden;
            }

            // Actualizar el rol si se proporcionó
            if (request.Role != null)
            {
                member.Role = request.Role;
            }

            // Persistir
            var result = await teamMemberRepository.UpdateAsync(member, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Team member updated successfully. TeamMemberId: {TeamMemberId}, NewRole: {NewRole}",
                member.Id, member.Role);

            return Result.Success;
        }
    }
}
