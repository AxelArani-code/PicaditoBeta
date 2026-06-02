using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad TimeSlot.
/// </summary>
public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
{
    /// <summary>
    /// Configura el mapeo de la entidad TimeSlot a la tabla 'time_slots'.
    /// </summary>
    public void Configure(EntityTypeBuilder<TimeSlot> builder)
    {
        builder.ToTable("time_slots");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.PitchId).HasColumnName("pitch_id");
        builder.Property(e => e.Date).HasColumnName("date");
        builder.Property(e => e.StartTime)
            .HasColumnName("start_time")
            .HasColumnType("time without time zone")
            .IsRequired();
        builder.Property(e => e.EndTime)
            .HasColumnName("end_time")
            .HasColumnType("time without time zone")
            .IsRequired();
        builder.Property(e => e.Price)
            .HasColumnName("price")
            .HasPrecision(10, 2)
            .IsRequired();
        builder.Property(e => e.Status).HasColumnName("status");
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd();

        // Relación: TimeSlot pertenece a un Pitch
        builder.HasOne(e => e.Pitch)
            .WithMany(p => p.TimeSlots)
            .HasForeignKey(e => e.PitchId)
            .OnDelete(DeleteBehavior.Cascade);

        // Índices
        builder.HasIndex(e => new { e.PitchId, e.Date })
            .HasDatabaseName("idx_time_slots_pitch_date");
    }
}
