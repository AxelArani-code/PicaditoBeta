using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Commands.UpdateVenue;

/// <summary>
/// Handler para el comando de actualizar un complejo deportivo.
/// </summary>
public class UpdateVenueHandler(
    IVenueRepository venueRepository,
    IValidator<UpdateVenueCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<UpdateVenueHandler> logger)
{
    private readonly ILogger<UpdateVenueHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(UpdateVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}, VenueId: {VenueId}", correlationId, request.Id))
        {
            _logger.LogInformation("Starting venue update for VenueId: {VenueId}", request.Id);

            // Validación usando FluentValidation
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

            if (!Enum.TryParse<UserRole>(currentUserService.Role, true, out var userRole))
            {
                _logger.LogWarning("Rol no reconocido: {Role}", currentUserService.Role);
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;
            var isOwner = userRole == UserRole.venue_owner;

            // Lógica de negocio según el rol del usuario
            if (userRole == UserRole.player)
            {
                // Los jugadores no pueden actualizar recintos
                _logger.LogWarning("Player role not authorized to update venues. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden actualizar recintos.");
            }

            if (userRole != UserRole.venue_owner && !isAdmin)
            {
                // Roles no autorizados (ni venue_owner ni admin)
                _logger.LogWarning("User role not authorized. UserId: {UserId}, Role: {Role}", userId, userRole);
                return Error.Forbidden(description: "No tienes permisos para actualizar recintos.");
            }

            // Verificar que el venue existe
            var venue = await venueRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (venue == null)
            {
                _logger.LogWarning("Venue not found. VenueId: {VenueId}", request.Id);
                return DomainErrors.Venue.NotFound;
            }

            // Verificar propiedad: si no es admin, solo el owner puede modificar
            if (!isAdmin && venue.OwnerId != userId)
            {
                _logger.LogWarning(
                    "Unauthorized update attempt. UserId: {UserId}, VenueOwnerId: {VenueOwnerId}, VenueId: {VenueId}, IsAdmin: {IsAdmin}",
                    userId, venue.OwnerId, request.Id, isAdmin);
                return DomainErrors.Venue.Forbidden;
            }

            // Actualizar campos
            if (!string.IsNullOrEmpty(request.Name))
            {
                venue.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.Address))
            {
                venue.Address = request.Address;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                venue.Description = request.Description;
            }

            if (!string.IsNullOrEmpty(request.City))
            {
                venue.City = request.City;
            }

            if (request.Phone != null)
            {
                venue.Phone = request.Phone;
            }

            if (request.Images != null)
            {
                venue.Images = request.Images;
            }

            if (request.IsActive.HasValue)
            {
                venue.IsActive = request.IsActive.Value;
            }

            // Solo el administrador puede cambiar el dueño del recinto
            if (request.OwnerId.HasValue)
            {
                if (isAdmin)
                {
                    // Admin puede transferir la propiedad
                    venue.OwnerId = request.OwnerId.Value;
                    _logger.LogInformation(
                        "Admin transferring venue ownership. VenueId: {VenueId}, NewOwnerId: {NewOwnerId}, AdminId: {AdminId}",
                        venue.Id, request.OwnerId.Value, userId);
                }
                else
                {
                    // El venue_owner no puede cambiar el OwnerId
                    _logger.LogWarning(
                        "Venue owner attempted to change OwnerId. VenueId: {VenueId}, UserId: {UserId}",
                        venue.Id, userId);
                    return Error.Forbidden("Venue.CannotTransfer", "No tienes permisos para transferir la propiedad del recinto.");
                }
            }

            // Persistir pasando el ID del usuario actual y el flag de administrador
            var result = await venueRepository.UpdateAsync(venue, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue updated successfully. VenueId: {VenueId}, Name: {Name}",
                venue.Id, venue.Name);

            return Result.Success;
        }
    }
}