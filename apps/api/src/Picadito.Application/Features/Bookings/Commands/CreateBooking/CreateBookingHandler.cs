using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
using System.Text.Json;
namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository, 
    ITimeSlotRepository timeSlotRepository,
    IPitchRepository pitchRepository,
    IValidator<CreateBookingCommand> validator,
    IHttpContextAccessor httpContextAccessor) 
{
    public async Task<ErrorOr<Guid>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {   
        // Logica de validacion usando FluentValidation
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.Errors.ConvertAll(error => 
                Error.Validation(error.PropertyName, error.ErrorMessage));
        }

        // Logica de TimeSlot y manejo de errores
        var timeSlot = await timeSlotRepository.GetByIdAsync(request.TimeSlotId, cancellationToken);
        if (timeSlot is null) return DomainErrors.Booking.NotFound;
        if (timeSlot.Status != SlotStatus.available.ToString()) return DomainErrors.Booking.NotAvailable;

        // Logica de JWT y manejo de errores
        var user = httpContextAccessor.HttpContext?.User;

        // Logica de politica: Un usuario debe estar autenticado para crear una reserva.  
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Error.Unauthorized(description: "Usuario no autenticado"  );
        var userId = Guid.Parse(userIdClaim);

        // Logica de politica: Un venue_owner solo puede crear reservas para sus propias canchas.
        var rawRoleClaim = httpContextAccessor.HttpContext?.User.FindFirst("app_metadata")?.Value;
        string? roleName = null;

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
                return Error.Unauthorized(description: "El formato del rol en el token es inválido.");
            }
        }

        if (!Enum.TryParse<UserRole>(roleName, true, out var userRole))
        {
            return Error.Forbidden(code: "Role.Invalid", description: $"El rol '{roleName}' no es reconocido.");
        }

        // Politica de seguridad segun rol
        if (userRole == UserRole.venue_owner)
        {
            // Si es Dueño, verificamos que la cancha (Pitch) le pertenezca
            var isOwner = await pitchRepository.IsOwnerAsync(timeSlot.PitchId, userId, cancellationToken);
            if (!isOwner) 
            {
                return Error.Forbidden(description: "No podés reservar en canchas que no son tuyas.");
            }
        }
        else if (userRole != UserRole.player)
        {
            // Si no es ni Player ni Owner, bloqueamos por seguridad
            return Error.Forbidden(description: "Tu perfil no tiene permisos para crear reservas.");
        }

        // 1. Verificación de integridad: ¿El slot está realmente libre?
        var isTaken = await bookingRepository.ExistsActiveBookingForSlotAsync(request.TimeSlotId, cancellationToken);
        if (isTaken)
        {
            return DomainErrors.Booking.SlotAlreadyTaken;
        }

        // Mapear de Command a Entidad de Dominio
        var booking = new Booking(
            request.TimeSlotId,
            timeSlot.PitchId,
            timeSlot.Date,
            userId,
            timeSlot.Price);

        // Persistir usando el repositorio (EF Core)
        await bookingRepository.AddAsync(booking, cancellationToken);

        // Retornar el ID generado
        return booking.Id;
    }
}
