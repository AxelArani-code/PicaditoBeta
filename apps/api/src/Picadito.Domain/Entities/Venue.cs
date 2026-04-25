using System;

namespace Picadito.Domain.Entities;

public class Venue
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    public List<string>? Images { get; set; } = new(); // Mapea a TEXT[] en PostgreSQL
    
    // This is the CRITICAL field for your RLS and Filters
    public Guid OwnerId { get; set; } 
    
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    // Navigation Property: One Venue has many Pitches
    public virtual ICollection<Pitch> Pitches { get; set; } = new List<Pitch>();
    
    // Navigation Property: Venue belongs to a Profile (Owner)
    public virtual Profile Owner { get; set; } = null!;
}
