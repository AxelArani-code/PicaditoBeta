using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Teams.Commands.UpdateTeam;

/// <summary>
/// Handler para el comando de actualizar un equipo.
/// </summary>
public class UpdateTeamHandler(
    ITeamRepository teamRepository,
    IValidator<UpdateTeamCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateTeamHandler> logger)
{
    private readonly ILogger<UpdateTeamHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TeamId: {TeamId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting team update for TeamId: {TeamId}", request.Id);

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

            // Validación de negocio: verificar que el equipo existe
            var team = await teamRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (team == null)
            {
                _logger.LogWarning("Team not found. TeamId: {TeamId}", request.Id);
                return DomainErrors.Team.NotFound;
            }

            // Verificar permisos: la política RLS "Captain can manage team"
            // permite solo al capitán o al administrador modificar el equipo
            if (!isAdmin && team.CaptainId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized update attempt. UserId: {UserId}, TeamCaptainId: {TeamCaptainId}, TeamId: {TeamId}",
                    userId, team.CaptainId, request.Id);
                return DomainErrors.Team.Forbidden;
            }

            // Actualizar campos
            if (!string.IsNullOrEmpty(request.Name))
            {
                team.Name = request.Name;
            }

            if (request.LogoUrl != null)
            {
                team.LogoUrl = request.LogoUrl;
            }

            // Solo el administrador puede transferir la capitanía
            if (request.CaptainId.HasValue)
            {
                if (isAdmin)
                {
                    team.CaptainId = request.CaptainId.Value;
                    _logger.LogInformation(
                        "Admin transferring team captaincy. TeamId: {TeamId}, NewCaptainId: {NewCaptainId}, AdminId: {AdminId}",
                        team.Id, request.CaptainId.Value, userId);
                }
                else
                {
                    _logger.LogWarning(
                        "Non-admin user attempted to transfer captaincy. TeamId: {TeamId}, UserId: {UserId}",
                        team.Id, userId);
                    return Error.Forbidden("Team.CannotTransfer", "No tienes permisos para transferir la capitanía del equipo.");
                }
            }

            // Persistir los cambios
            var result = await teamRepository.UpdateAsync(team, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Team updated successfully. TeamId: {TeamId}, Name: {Name}",
                team.Id, team.Name);

            return Result.Success;
        }
    }
}
