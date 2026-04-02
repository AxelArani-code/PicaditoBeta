using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Picadito.Domain.Errors;
using Picadito.Domain.Enums;
using ErrorOr;
namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository, 
    ITimeSlotRepository timeSlotRepository,
    IValidator<CreateBookingCommand> validator,
    IHttpContextAccessor httpContextAccessor) // INyeccion del validador
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
        // Aqui obtenemos el UserId del token JWT usando el HttpContext
        var user = httpContextAccessor.HttpContext?.User;

        // El ID de usuario en tokens de Supabase  
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        // Manejo de errores: si el UserId no está presente en el token
        if (string.IsNullOrEmpty(userIdClaim)) return Error.Unauthorized();

        var userId = Guid.Parse(userIdClaim);

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
