using System;
using System.Diagnostics;
using Picadito.Application.Common.Interfaces;
using Picadito.Application.Common.Models;
using Picadito.Application.DTOs;
using FluentValidation;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Teams.Queries.GetAllTeams;

/// <summary>
/// Handler para obtener todos los equipos con paginación.
/// Acceso público (sin autenticación), reflejando la política RLS
/// "Teams viewable by everyone if not deleted".
/// </summary>
public class GetAllTeamsHandler(
    ITeamRepository teamRepository,
    IValidator<GetAllTeamsQuery> validator,
    ILogger<GetAllTeamsHandler> logger)
{
    private readonly ILogger<GetAllTeamsHandler> _logger = logger;

    public async Task<ErrorOr<PagedResponse<TeamDto>>> Handle(GetAllTeamsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "GetAllTeams requested: Name={Name}, PageNumber={PageNumber}, PageSize={PageSize}",
            request.Name, request.PageNumber, request.PageSize);

        // Validación usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Validation failed. Errors: {Errors}",
                string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return validationResult.Errors.ConvertAll(error =>
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Consulta al repositorio con paginación
        var result = await teamRepository.GetAllAsync(
            request.Name,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        if (result.IsError)
        {
            return result.Errors;
        }

        _logger.LogInformation(
            "GetAllTeams completed: PageNumber={PageNumber}, PageSize={PageSize}, ItemsCount={ItemsCount}, TotalCount={TotalCount}, TotalPages={TotalPages}",
            result.Value.PageNumber,
            result.Value.PageSize,
            result.Value.Items.Count,
            result.Value.TotalCount,
            result.Value.TotalPages);

        return result.Value;
    }
}
