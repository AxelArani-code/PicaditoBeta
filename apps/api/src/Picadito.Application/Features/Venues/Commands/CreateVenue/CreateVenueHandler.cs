using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Venues.Commands.CreateVenue;

/// <summary>
/// Handler para el comando de crear un nuevo complejo deportivo.
/// </summary>
public class CreateVenueHandler(
    IVenueRepository venueRepository,
    IValidator<CreateVenueCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateVenueHandler> logger)
{
    private readonly ILogger<CreateVenueHandler> _logger = logger;

    public async Task<ErrorOr<Guid>> Handle(CreateVenueCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation("Starting venue creation for Name: {Name}", request.Name);

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

            if (currentUserService.UserRole is not { } userRole)
            {
                return Error.Forbidden(code: "Role.Invalid", description: "El rol no es reconocido.");
            }

            var isAdmin = currentUserService.IsAdmin;
            var isOwner = userRole == UserRole.venue_owner;

            // Lógica de negocio según el rol del usuario
            if (userRole == UserRole.player)
            {
                // Los jugadores no pueden crear recintos
                _logger.LogWarning("Player role not authorized to create venues. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden crear recintos.");
            }

            if (userRole != UserRole.venue_owner && !isAdmin)
            {
                // Roles no autorizados (ni venue_owner ni admin)
                _logger.LogWarning("User role not authorized. UserId: {UserId}, Role: {Role}", userId, userRole);
                return Error.Forbidden(description: "No tienes permisos para crear recintos.");
            }

            // Verificar si ya existe un venue con ese nombre
            var exists = await venueRepository.ExistsByNameAsync(request.Name, cancellationToken);
            if (exists)
            {
                _logger.LogWarning("Venue already exists. Name: {Name}", request.Name);
                return DomainErrors.Venue.AlreadyExists;
            }

            // Determinar el OwnerId según el rol del usuario
            Guid ownerId;
            if (isAdmin)
            {
                // Si es admin: usar el OwnerId del comando si existe; si no, usar el ID del admin logueado
                ownerId = request.OwnerId ?? userId;
                _logger.LogInformation(
                    "Admin creating venue. AdminId: {AdminId}, AssignedOwnerId: {OwnerId}, ProvidedOwnerId: {ProvidedOwnerId}",
                    userId, ownerId, request.OwnerId);
            }
            else
            {
                // Si es venue_owner: forzar siempre el uso del ID del usuario logueado (por seguridad)
                ownerId = userId;
            }

            // Crear la entidad
            var venue = new Venue
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Address = request.Address,
                City = request.City,
                Phone = request.Phone,
                Images = request.Images ?? new List<string>(),
                Description = request.Description,
                OwnerId = ownerId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // Persistir pasando el ID del usuario actual y el flag de administrador
            var result = await venueRepository.AddAsync(venue, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue created successfully. VenueId: {VenueId}, Name: {Name}, OwnerId: {OwnerId}",
                result.Value, venue.Name, venue.OwnerId);

            return result.Value;
        }
    }
}