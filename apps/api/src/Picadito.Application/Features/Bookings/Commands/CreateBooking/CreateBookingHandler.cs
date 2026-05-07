using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository, 
    ITimeSlotRepository timeSlotRepository,
    IPitchRepository pitchRepository,
    IValidator<CreateBookingCommand> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CreateBookingHandler> logger) 
{
    private readonly ILogger<CreateBookingHandler> _logger = logger;
    
    public async Task<ErrorOr<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id ?? httpContextAccessor.HttpContext?.TraceIdentifier;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TimeSlotId: {TimeSlotId}", 
            correlationId, request.TimeSlotId))
        {
            _logger.LogInformation("Starting booking creation for TimeSlotId: {TimeSlotId}", request.TimeSlotId);
            
            // Logica de validacion usando FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}", 
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error => 
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Logica de TimeSlot y manejo de errores
            var timeSlot = await timeSlotRepository.GetByIdAsync(request.TimeSlotId, cancellationToken);
            if (timeSlot is null) 
            {
                _logger.LogWarning("Time slot not found. TimeSlotId: {TimeSlotId}", request.TimeSlotId);
                return DomainErrors.Booking.NotFound;
            }
            if (timeSlot.Status != SlotStatus.available.ToString()) 
            {
                _logger.LogWarning("Time slot not available. TimeSlotId: {TimeSlotId}, Status: {Status}", 
                    request.TimeSlotId, timeSlot.Status);
                return DomainErrors.Booking.NotAvailable;
            }

            // Logica de JWT y manejo de errores
            var user = httpContextAccessor.HttpContext?.User;

            // Logica de politica: Un usuario debe estar autenticado para crear una reserva.  
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _logger.LogWarning("User not authenticated");
                return Error.Unauthorized(description: "Usuario no autenticado"  );
            }
            var userId = Guid.Parse(userIdClaim);

            // Extraer rol desde app_metadata (formato JSON)
            var rawRoleClaim = httpContextAccessor.HttpContext?.User.FindFirst("app_metadata")?.Value;
            string? roleName = null;
            bool isAdmin = false;

            // Parsing para extraer el rol
            if (!string.IsNullOrEmpty(rawRoleClaim))
            {
                try
                {
                    using var jsonDoc = JsonDocument.Parse(rawRoleClaim);
                    if (jsonDoc.RootElement.TryGetProperty("role", out var roleElement))
                    {
                        roleName = roleElement.GetString();
                    }
                }
                catch
                {
                    _logger.LogWarning("Invalid role format in token");
                    return Error.Unauthorized(description: "El formato del rol en el token es inválido.");
                }
            }

            // Determinar el rol del usuario y si es administrador
            if (!Enum.TryParse<UserRole>(roleName, true, out var userRole))
            {
                _logger.LogWarning("Invalid role. Role: {Role}", roleName);
                return Error.Forbidden(code: "Role.Invalid", description: $"El rol '{roleName}' no es reconocido.");
            }

            // Verificar si el usuario tiene rol de administrador
            isAdmin = userRole == UserRole.admin;

            // Lógica de negocio según el rol del usuario
            if (userRole == UserRole.player)
            {
                // El Player solo puede reservar para sí mismo
                _logger.LogInformation("Player {UserId} is creating a booking.", userId);
            }
            else if (userRole == UserRole.venue_owner)
            {
                // Si es Dueño, verificamos que la cancha (Pitch) le pertenezca
                var isOwner = await pitchRepository.IsOwnerAsync(timeSlot.PitchId, userId, cancellationToken);
                if (!isOwner) 
                {
                    _logger.LogWarning("El usuario no es dueño de la cancha. UserId: {UserId}, PitchId: {PitchId}", 
                        userId, timeSlot.PitchId);
                    return Error.Forbidden(description: "No podés reservar en canchas que no son tuyas.");
                }
            }
            else if (isAdmin)
            {
                // El Admin tiene "vía libre": puede crear reservas en cualquier cancha
                _logger.LogInformation("Admin {UserId} is creating a booking.", userId);
            }
            else 
            {
                // Si no es ni Player, Owner ni Admin, bloqueamos por seguridad
                _logger.LogWarning("User role not recognized. Role: {Role}", userRole);
                return Error.Forbidden(description: "Tu perfil no tiene permisos para crear reservas.");
            }

            // 1. Verificación de integridad: ¿El slot está realmente libre?
            var isTaken = await bookingRepository.ExistsActiveBookingForSlotAsync(request.TimeSlotId, cancellationToken);
            if (isTaken)
            {
                _logger.LogWarning("Slot already taken. TimeSlotId: {TimeSlotId}", request.TimeSlotId);
                return DomainErrors.Booking.SlotAlreadyTaken;
            }

            // Determinar el UserId según el rol del usuario
            Guid bookingUserId;
            if (isAdmin && request.UserId.HasValue)
            {
                // Si es admin y el comando trae un UserId, usar ese ID para la reserva
                bookingUserId = request.UserId.Value;
                _logger.LogInformation(
                    "Admin [Id] creando reserva para el usuario [TargetId]. AdminId: {AdminId}, TargetUserId: {TargetUserId}",
                    userId, bookingUserId);
            }
            else
            {
                // Para cualquier otro rol, ignorar el UserId del comando y forzar el uso del ID del usuario logueado
                bookingUserId = userId;
            }

            // Mapear de Command a Entidad de Dominio
            var booking = new Booking(
                request.TimeSlotId,
                timeSlot.PitchId,
                timeSlot.Date,
                bookingUserId,
                timeSlot.Price);

            // Persistir usando el repositorio (EF Core)
            var result = await bookingRepository.AddAsync(booking, userId, isAdmin, cancellationToken);

            if (result.IsError)
            {
                return result.Errors;
            }

            _logger.LogInformation("Booking created successfully. BookingId: {BookingId}, PitchId: {PitchId}, TimeSlotId: {TimeSlotId}", 
                result.Value, timeSlot.PitchId, request.TimeSlotId);

            // Retornar el ID generado
            return result.Value;
        }
    }
}
