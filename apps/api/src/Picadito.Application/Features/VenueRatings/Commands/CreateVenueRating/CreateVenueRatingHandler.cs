using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.VenueRatings.Commands.CreateVenueRating;

/// <summary>
/// Handler para crear una calificación.
/// La política RLS "Participants can rate" exige que el usuario sea participante
/// del partido y que user_id coincida con el usuario autenticado.
/// </summary>
public class CreateVenueRatingHandler(
    IVenueRatingRepository venueRatingRepository,
    IVenueRepository venueRepository,
    IValidator<CreateVenueRatingCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateVenueRatingHandler> logger)
{
    private readonly ILogger<CreateVenueRatingHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateVenueRatingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Creating venue rating. VenueId: {VenueId}, MatchId: {MatchId}, Rating: {Rating}",
                request.VenueId, request.MatchId, request.Rating);

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

            // Validar que el complejo deportivo existe
            var venue = await venueRepository.GetEntityByIdAsync(request.VenueId, cancellationToken);
            if (venue == null)
            {
                _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.VenueId);
                return DomainErrors.Venue.NotFound;
            }

            // Si se proporciona un MatchId, validar que el usuario es participante del partido
            // (política RLS "Participants can rate")
            if (request.MatchId.HasValue)
            {
                var isParticipant = await venueRatingRepository.IsMatchParticipantAsync(userId, request.MatchId.Value, cancellationToken);
                if (!isParticipant)
                {
                    _logger.LogWarning(
                        "User is not a match participant. UserId: {UserId}, MatchId: {MatchId}",
                        userId, request.MatchId.Value);
                    return DomainErrors.VenueRating.NotParticipant;
                }

                // Verificar que el usuario no haya calificado ya este partido
                var alreadyRated = await venueRatingRepository.HasRatedMatchAsync(userId, request.MatchId.Value, cancellationToken);
                if (alreadyRated)
                {
                    _logger.LogWarning(
                        "User already rated this match. UserId: {UserId}, MatchId: {MatchId}",
                        userId, request.MatchId.Value);
                    return DomainErrors.VenueRating.AlreadyRated;
                }
            }

            // Crear la entidad VenueRating
            var rating = new VenueRating
            {
                Id = Guid.NewGuid(),
                VenueId = request.VenueId,
                UserId = userId, // Forzado al usuario autenticado (política RLS)
                MatchId = request.MatchId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var result = await venueRatingRepository.AddAsync(rating, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue rating created successfully. VenueRatingId: {VenueRatingId}, VenueId: {VenueId}, UserId: {UserId}, Rating: {Rating}",
                result.Value, rating.VenueId, rating.UserId, rating.Rating);

            return result.Value;
        }
    }
}
