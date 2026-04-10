using System;
using Picadito.Domain.Entities;
namespace Picadito.Application.Common.Interfaces;

// Esta interfaz define el contrato para el repositorio de reservas. 
// Contiene el método para agregar una nueva reserva de forma asíncrona.
public interface IBookingRepository
{
    Task AddAsync(Booking booking, CancellationToken cancellationToken);
}
