using System;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.TeamMembers.Queries.GetAllTeamMembers;

/// <summary>
/// Handler para obtener todos los miembros de equipo.
/// Acceso público (sin autenticación) según la política RLS "viewable by everyone".
/// </summary>
public class GetAllTeamMembersHandler(
    ITeamMemberRepository teamMemberRepository,
    IValidator<GetAllTeamMembersQuery> validator,
    ILogger<GetAllTeamMembersHandler> logger)
{
    private readonly ILogger<GetAllTeamMembersHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<TeamMemberDto>>> Handle(GetAllTeamMembersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllTeamMembers requested: TeamId={TeamId}, UserId={UserId}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.TeamId, request.UserId, request.PageNumber, request.PageSize);

        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        var result = await teamMemberRepository.GetAllAsync(
            request.TeamId,
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllTeamMembers completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}",
            result.Value.PageNumber, result.Value.PageSize, result.Value.Items.Count, result.Value.TotalCount);

        return result.Value;
    }
}
