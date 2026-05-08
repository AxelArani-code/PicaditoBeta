namespace Picadito.Application.DTOs;

/// <summary>
/// DTO para representar un complejo deportivo en las respuestas de la API.
/// </summary>
public class VenueDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    public List<string>? Images { get; set; } = new();
    public Guid OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public double? AverageRating { get; set; }
    public int? RatingCount { get; set; }
    public int PitchCount { get; set; }
}

/// <summary>
/// DTO para crear un nuevo complejo deportivo.
/// </summary>
public class CreateVenueDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty; 
    public string? Phone { get; set; }
    public List<string>? Images { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// DTO para actualizar un complejo deportivo.
/// </summary>
public class UpdateVenueDto
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public List<string>? Images { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}