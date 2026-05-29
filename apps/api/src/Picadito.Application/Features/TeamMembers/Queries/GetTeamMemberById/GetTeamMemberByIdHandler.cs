using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.DTOs;
using Picadito.Domain.Errors;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.TeamMembers.Queries.GetTeamMemberById;

/// <summary>
/// Handler para obtener un miembro del equipo por su ID.
/// Acceso público (sin autenticación).
/// </summary>
public class GetTeamMemberByIdHandler(
    ITeamMemberRepository teamMemberRepository,
    ILogger<GetTeamMemberByIdHandler> logger)
{
    private readonly ILogger<GetTeamMemberByIdHandler> _logger = logger;

    public async Task<ErrorOr<TeamMemberDto>> Handle(GetTeamMemberByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetTeamMemberById requested: TeamMemberId={TeamMemberId}", request.Id);

        var member = await teamMemberRepository.GetByIdAsync(request.Id, cancellationToken);

        if (member == null)
        {
            _logger.LogWarning("Team member not found. TeamMemberId: {TeamMemberId}", request.Id);
            return DomainErrors.TeamMember.NotFound;
        }

        _logger.LogInformation(
            "GetTeamMemberById completed: TeamMemberId={TeamMemberId}, UserId={UserId}",
            member.Id, member.UserId);

        return member;
    }
}
