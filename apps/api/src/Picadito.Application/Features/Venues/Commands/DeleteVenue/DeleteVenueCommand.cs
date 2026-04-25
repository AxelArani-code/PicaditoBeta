using System;

namespace Picadito.Application.Features.Venues.Commands.DeleteVenue;

/// <summary>
/// Comando para eliminar un complejo deportivo (Soft Delete).
/// </summary>
public class DeleteVenueCommand
{
    public Guid Id { get; set; }
}