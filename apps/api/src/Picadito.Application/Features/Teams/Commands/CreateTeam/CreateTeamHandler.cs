using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Teams.Commands.CreateTeam;

/// <summary>
/// Handler para el comando de crear un nuevo equipo.
/// </summary>
public class CreateTeamHandler(
    ITeamRepository teamRepository,
    IValidator<CreateTeamCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateTeamHandler> logger)
{
    private readonly ILogger<CreateTeamHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting team creation for Name: {Name}", request.Name);

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

            // Validación de negocio: verificar si ya existe un equipo con ese nombre
            var exists = await teamRepository.ExistsByNameAsync(request.Name, cancellationToken);
            if (exists)
            {
                _logger.LogWarning("Team already exists. Name: {Name}", request.Name);
                return DomainErrors.Team.AlreadyExists;
            }

            // Determinar el CaptainId según el rol del usuario.
            // La política RLS "Captain can manage team" exige que el capitán
            // sea el usuario autenticado, a menos que sea administrador.
            Guid captainId;
            if (isAdmin)
            {
                // Admin puede asignar un capitán diferente; si no se provee, usa su propio ID
                captainId = request.CaptainId ?? userId;
                _logger.LogInformation(
                    "Admin creating team. AdminId: {AdminId}, AssignedCaptainId: {CaptainId}, ProvidedCaptainId: {ProvidedCaptainId}",
                    userId, captainId, request.CaptainId);
            }
            else
            {
                // Para venue_owner y player: forzar el uso del ID del usuario logueado
                captainId = userId;
            }

            // Crear la entidad Team
            var team = new Team
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = string.Empty, // La BD genera el slug automáticamente (trigger teams_slugify)
                LogoUrl = request.LogoUrl,
                CaptainId = captainId,
                CreatedAt = DateTime.UtcNow
            };

            // Persistir en la base de datos
            var result = await teamRepository.AddAsync(team, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Team created successfully. TeamId: {TeamId}, Name: {Name}, CaptainId: {CaptainId}",
                result.Value, team.Name, team.CaptainId);

            return result.Value;
        }
    }
}
