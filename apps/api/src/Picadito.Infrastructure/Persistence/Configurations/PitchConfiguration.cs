using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad Pitch.
/// </summary>
public class PitchConfiguration : IEntityTypeConfiguration<Pitch>
{
    /// <summary>
    /// Configura el mapeo de la entidad Pitch a la tabla 'pitches'.
    /// </summary>
    public void Configure(EntityTypeBuilder<Pitch> builder)
    {
        builder.ToTable("pitches");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Name).HasColumnName("name");
        builder.Property(e => e.VenueId).HasColumnName("venue_id");
        
        // Mapeo de Enums como string
        builder.Property(e => e.Type)
            .HasColumnName("type")
            .HasConversion(
                // Al guardar en la DB: de Enum a String
                v => v == PitchType.FiveV5 ? "5v5" :
                v == PitchType.SevenV7 ? "7v7" :
                v == PitchType.NineV9 ? "9v9" :
                v == PitchType.ElevenV11 ? "11v11" : v.ToString(),

                // Al leer de la DB: de String a Enum
                v => v == "5v5" ? PitchType.FiveV5 :
                v == "7v7" ? PitchType.SevenV7 :
                v == "9v9" ? PitchType.NineV9 :
                v == "11v11" ? PitchType.ElevenV11 : (PitchType)Enum.Parse(typeof(PitchType), v)
            )
            .IsRequired();
        
        builder.Property(e => e.Surface)
            .HasColumnName("surface")
            .HasConversion<string>()
            .IsRequired();
        
        builder.Property(e => e.PricePerHour)
            .HasColumnName("price_per_hour")
            .HasPrecision(10, 2)
            .IsRequired();
        
        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Columnas de auditoría
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .ValueGeneratedOnAddOrUpdate()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Relaciones de navegación
        builder.HasOne(p => p.Venue)
              .WithMany(v => v.Pitches)
              .HasForeignKey(p => p.VenueId)
              .OnDelete(DeleteBehavior.Cascade);

        // Filtro global: solo canchas no eliminadas
        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}
