using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Teams.Queries.GetTeamById;

/// <summary>
/// Handler para obtener un equipo por su ID.
/// Acceso público (sin autenticación).
/// </summary>
public class GetTeamByIdHandler(
    ITeamRepository teamRepository,
    ILogger<GetTeamByIdHandler> logger)
{
    private readonly ILogger<GetTeamByIdHandler> _logger = logger;

    public async Task<ErrorOr<TeamDto>> Handle(GetTeamByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetTeamById requested: TeamId={TeamId}", request.Id);

        var team = await teamRepository.GetByIdAsync(request.Id, cancellationToken);

        if (team == null)
        {
            _logger.LogWarning("Team not found. TeamId: {TeamId}", request.Id);
            return DomainErrors.Team.NotFound;
        }

        _logger.LogInformation(
            "GetTeamById completed: TeamId={TeamId}, Name={Name}",
            team.Id, team.Name);

        return team;
    }
}
