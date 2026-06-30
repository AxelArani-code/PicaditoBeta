using System;
using System.Diagnostics;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using Microsoft.Extensions.Logging;

namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository, 
    ITimeSlotRepository timeSlotRepository,
    IPitchRepository pitchRepository,
    IValidator<CreateBookingCommand> validator,
    ICurrentUserService currentUserService,
    ILogger<CreateBookingHandler> logger) 
{
    private readonly ILogger<CreateBookingHandler> _logger = logger;
    
    public async Task<ErrorOr<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var correlationId = Activity.Current?.Id;
        
        using (_logger.BeginScope("CorrelationId: {CorrelationId}, TimeSlotId: {TimeSlotId}", 
            correlationId, request.TimeSlotId))
        {
            _logger.LogInformation("Starting booking creation for TimeSlotId: {TimeSlotId}", request.TimeSlotId);

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

            // Logica de validacion usando FluentValidation
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed. Errors: {Errors}", 
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return validationResult.Errors.ConvertAll(error => 
                    Error.Validation(error.PropertyName, error.ErrorMessage));
            }

            // Obtener el TimeSlot usando la nueva firma con seguridad
            var timeSlotResult = await timeSlotRepository.GetByIdAsync(
                request.TimeSlotId, userId, userRole, cancellationToken);

            if (timeSlotResult.IsError)
            {
                return timeSlotResult.Errors;
            }

            var timeSlot = timeSlotResult.Value;

            if (timeSlot.Status != SlotStatus.available.ToString()) 
            {
                _logger.LogWarning("Time slot not available. TimeSlotId: {TimeSlotId}, Status: {Status}", 
                    request.TimeSlotId, timeSlot.Status);
                return DomainErrors.Booking.NotAvailable;
            }

            var isOwner = userRole == UserRole.venue_owner;

            // Lógica de negocio según el rol del usuario
            if (userRole == UserRole.player)
            {
                // El Player solo puede reservar para sí mismo
                _logger.LogInformation("Player {UserId} is creating a booking.", userId);
            }
            else if (userRole == UserRole.venue_owner)
            {
                // Si es Dueño, verificamos que la cancha (Pitch) le pertenezca
                var isPitchOwner = await pitchRepository.IsOwnerAsync(timeSlot.PitchId, userId, cancellationToken);
                if (!isPitchOwner) 
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
