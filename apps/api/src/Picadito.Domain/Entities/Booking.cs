using System;
using Picadito.Domain.Enums;

namespace Picadito.Domain.Entities;

/// <summary>
/// Representa una reserva de un turno de cancha.
/// Una reserva pertenece a un TimeSlot, un Pitch y un Usuario (Profile).
/// </summary>
public class Booking
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Identificador del turno asociado a esta reserva.
    /// </summary>
    public Guid TimeSlotId { get; private set; }
    
    /// <summary>
    /// Identificador de la cancha (desnormalizado para consultas rápidas).
    /// </summary>
    public Guid PitchId { get; private set; }
    
    /// <summary>
    /// Fecha de la reserva (desnormalizado para consultas rápidas).
    /// </summary>
    public DateOnly Date { get; private set; }
    
    /// <summary>
    /// Identificador del usuario que realizó la reserva.
    /// </summary>
    public Guid UserId { get; private set; }
    
    /// <summary>
    /// Precio total de la reserva.
    /// </summary>
    public decimal TotalPrice { get; private set; }
    
    /// <summary>
    /// Estado de la reserva (pending, confirmed, rejected, cancelled).
    /// </summary>
    public BookingStatus Status { get; private set; }
    
    /// <summary>
    /// Estado del pago (pending, paid, refunded, etc.).
    /// </summary>
    public string PaymentStatus { get; private set; } = "pending";
    
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    
    /// <summary>
    /// Relación de navegación: La reserva pertenece a un TimeSlot.
    /// </summary>
    public virtual TimeSlot TimeSlot { get; private set; } = null!;
    
    /// <summary>
    /// Relación de navegación: La reserva pertenece a un Pitch.
    /// </summary>
    public virtual Pitch Pitch { get; private set; } = null!;
    
    /// <summary>
    /// Relación de navegación: La reserva pertenece a un Usuario (Profile).
    /// </summary>
    public virtual Profile User { get; private set; } = null!;

    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private Booking() { }

    /// <summary>
    /// Constructor para crear una nueva reserva.
    /// </summary>
    /// <param name="timeSlotId">ID del turno.</param>
    /// <param name="pitchId">ID de la cancha.</param>
    /// <param name="date">Fecha de la reserva.</param>
    /// <param name="userId">ID del usuario.</param>
    /// <param name="totalPrice">Precio total.</param>
    public Booking(
        Guid timeSlotId,
        Guid pitchId,
        DateOnly date,
        Guid userId,
        decimal totalPrice)
    {
        Id = Guid.NewGuid();
        TimeSlotId = timeSlotId;
        PitchId = pitchId;
        Date = date;
        UserId = userId;
        TotalPrice = totalPrice;
        Status = BookingStatus.pending;
        PaymentStatus = "pending";
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
