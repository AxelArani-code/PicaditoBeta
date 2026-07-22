using System.Diagnostics;
using Picadito.Domain.Enums;
using Picadito.Domain.Errors;
using Picadito.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using ErrorOr;

namespace Picadito.Application.Features.VenueClosures.Commands.DeleteVenueClosure;

public class DeleteVenueClosureHandler(
    IVenueClosureRepository venueClosureRepository,
    ICurrentUserService currentUserService,
    ILogger<DeleteVenueClosureHandler> logger)
{
    private readonly ILogger<DeleteVenueClosureHandler> _logger = logger;

    public async Task<ErrorOr<Success>> Handle(DeleteVenueClosureCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId))
        {
            _logger.LogInformation(
                "Iniciando eliminación de cierre. ClosureId: {ClosureId}", request.Id);

            // Verificar autenticación
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

            // Los jugadores no pueden eliminar cierres (política RLS)
            if (userRole == UserRole.player)
            {
                _logger.LogWarning("Player role not authorized to delete venue closures. UserId: {UserId}", userId);
                return Error.Forbidden(description: "Los jugadores no pueden eliminar cierres.");
            }

            // Verificar que el cierre exista y que el usuario tenga permisos
            var closure = await venueClosureRepository.GetEntityByIdAsync(request.Id, cancellationToken);
            if (closure is null)
            {
                _logger.LogWarning(
                    "Venue closure not found. ClosureId: {ClosureId}", request.Id);
                return DomainErrors.VenueClosure.NotFound;
            }

            // Validar propiedad si no es admin
            if (!isAdmin)
            {
                var isOwner = await venueClosureRepository.IsOwnerAsync(request.Id, userId, cancellationToken);
                if (!isOwner)
                {
                    _logger.LogWarning(
                        "User is not owner of the closure's venue. UserId: {UserId}, ClosureId: {ClosureId}",
                        userId, request.Id);
                    return DomainErrors.VenueClosure.Forbidden;
                }
            }

            var result = await venueClosureRepository.DeleteAsync(request.Id, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation(
                "Venue closure deleted successfully. ClosureId: {ClosureId}, UserId: {UserId}, IsAdmin: {IsAdmin}",
                request.Id, userId, isAdmin);

            return Result.Success;
        }
    }
}
