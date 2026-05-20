using System;
using Picadito.Domain.Enums;

namespace Picadito.Domain.Entities;

/// <summary>
/// Representa una cancha dentro de un Venue.
/// Un Venue puede tener múltiples Pitches (relación 1:N).
/// </summary>
public class Pitch
{
    public Guid Id { get; private set; }
    
    /// <summary>
    /// Nombre de la cancha (ej: "Cancha 1", "Futbol 5").
    /// </summary>
    public string Name { get; private set; } = string.Empty;
    
    /// <summary>
    /// Identificador del Venue al que pertenece esta cancha.
    /// </summary>
    public Guid VenueId { get; private set; }
    
    /// <summary>
    /// Tipo de cancha según la cantidad de jugadores (5v5, 7v7, 9v9, 11v11).
    /// </summary>
    public PitchType Type { get; private set; }
    
    /// <summary>
    /// Tipo de superficie de la cancha (césped natural, sintético, cemento, parquet).
    /// </summary>
    public SurfaceType Surface { get; private set; }
    
    /// <summary>
    /// Precio por hora de la cancha.
    /// </summary>
    public decimal PricePerHour { get; private set; }
    
    /// <summary>
    /// Indica si la cancha está activa y disponible para reservas.
    /// </summary>
    public bool IsActive { get; private set; } = true;
    
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Fecha de eliminación lógica. Si es null, la cancha está activa.
    /// </summary>
    public DateTime? DeletedAt { get; private set; }

    /// <summary>
    /// Relación de navegación: La cancha pertenece a un Venue.
    /// </summary>
    public virtual Venue Venue { get; private set; } = null!;

    /// <summary>
    /// Relación de navegación: Una cancha puede tener múltiples TimeSlots.
    /// </summary>
    public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();

    /// <summary>
    /// Constructor para EF Core.
    /// </summary>
    private Pitch() { }

    /// <summary>
    /// Constructor para crear una nueva cancha.
    /// </summary>
    /// <param name="name">Nombre de la cancha.</param>
    /// <param name="venueId">ID del Venue al que pertenece.</param>
    /// <param name="type">Tipo de cancha.</param>
    /// <param name="surface">Tipo de superficie.</param>
    /// <param name="pricePerHour">Precio por hora.</param>
    public Pitch(string name, Guid venueId, PitchType type, SurfaceType surface, decimal pricePerHour)
    {
        Id = Guid.NewGuid();
        Name = name;
        VenueId = venueId;
        Type = type;
        Surface = surface;
        PricePerHour = pricePerHour;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string name, PitchType type, SurfaceType surface, decimal pricePerHour, bool isActive)
    {
        Name = name;
        Type = type;
        Surface = surface;
        PricePerHour = pricePerHour;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        DeletedAt = DateTime.UtcNow;
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
