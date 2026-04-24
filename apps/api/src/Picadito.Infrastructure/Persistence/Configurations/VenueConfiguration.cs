using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad Venue.
/// </summary>
public class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    /// <summary>
    /// Configura el mapeo de la entidad Venue a la tabla 'venues'.
    /// </summary>
    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("venues");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.OwnerId).HasColumnName("owner_id");
        builder.Property(e => e.Name).HasColumnName("name");
        builder.Property(e => e.Address).HasColumnName("address");
        builder.Property(e => e.Description).HasColumnName("description");
        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Columnas de auditoría
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Filtro global: solo venues no eliminados
        builder.HasQueryFilter(v => v.DeletedAt == null);
    }
}
