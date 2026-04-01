using System;
using Picadito.Domain.Entities;
using Picadito.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
namespace Picadito.Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository, 
    ITimeSlotRepository timeSlotRepository,
    IValidator<CreateBookingCommand> validator,
    IHttpContextAccessor httpContextAccessor) // INyeccion del validador
{
    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        // 1. Validación de FluentValidation (Sintáctica/Formato)
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            // Aquí va el manejo de errores personalizado.
            throw new ValidationException(validationResult.Errors);
        }

        // Buscamos el TimeSlot en la base de datos
        var timeSlot = await timeSlotRepository.GetByIdAsync(request.TimeSlotId, cancellationToken);

        // Validacion
        if (timeSlot == null)
            throw new Exception("No se encontró el TimeSlot especificado.");
        if (timeSlot.Status != "available")
            throw new Exception("TimeSlot no esta disponible para reserva.");

        // Aqui obtenemos el UserId del token JWT usando el HttpContext
        var user = httpContextAccessor.HttpContext?.User;

        // El ID de usuario en tokens de Supabase  
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new Exception("Usuario no autenticado.");
        }  
        var userId = Guid.Parse(userIdClaim);

        // 1. Mapear de Command a Entidad de Dominio
        var booking = new Booking(
            request.TimeSlotId,
            timeSlot.PitchId,
            timeSlot.Date,
            userId,
            timeSlot.Price);

        // 2. Persistir usando el repositorio (EF Core)
        await bookingRepository.AddAsync(booking, cancellationToken);

        // 3. Retornar el ID generado
        return booking.Id;
    }
}
