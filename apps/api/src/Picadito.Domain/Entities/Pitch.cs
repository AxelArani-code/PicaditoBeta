using System;

namespace Picadito.Domain.Entities;

public class Pitch
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid VenueId { get; private set; }

    // Relación de navegación
    public virtual Venue Venue { get; private set; } = null!;

    // Constructor para EF Core
    // private Pitch() { }

    // Constructor para crear una nueva cancha
    public Pitch(string name, Guid venueId)
    {
        Id = Guid.NewGuid();
        Name = name;
        VenueId = venueId;
    }
}
