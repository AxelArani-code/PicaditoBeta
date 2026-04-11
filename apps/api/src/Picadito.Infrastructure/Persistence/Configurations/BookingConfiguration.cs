using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad Booking.
/// </summary>
public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    /// <summary>
    /// Configura el mapeo de la entidad Booking a la tabla 'bookings'.
    /// </summary>
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.TimeSlotId).HasColumnName("time_slot_id");
        builder.Property(e => e.PitchId).HasColumnName("pitch_id");
        builder.Property(e => e.Date).HasColumnName("date");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.TotalPrice).HasColumnName("total_price").HasPrecision(10, 2);

        // Mapeo del enum Status como string (para PostgreSQL)
        // El trigger booking_status_changed espera valores: pending, confirmed, rejected, cancelled
        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            // Le decimos a EF: "En el INSERT, no mandes nada, dejá que la DB lo genere"
            .ValueGeneratedOnAdd();  

        // El trigger dispara cuando cambia el estado
        builder.Property(e => e.Status)
            .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Save);

        // Mapeo de PaymentStatus como string
        builder.Property(e => e.PaymentStatus)
            .HasColumnName("payment_status")
            .HasConversion<string>()
            // Permitimos que la DB use su DEFAULT 'pending' en el INSERT
            .ValueGeneratedOnAdd();

        // Columnas de auditoría gestionadas por triggers de PostgreSQL
        
        // created_at: Se genera automáticamente por el DEFAULT en PostgreSQL
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        // updated_at: Se genera automáticamente por el trigger set_updated_at_bookings
        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .ValueGeneratedOnAddOrUpdate()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        // deleted_at para soft delete
        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Las columnas desnormalizadas (pitch_id, date) son opcionales en la entidad
        // ya que el trigger set_booking_denormalized_data_trigger las genera automáticamente
        // si no se proporcionan en el INSERT

        // Relaciones de navegación
        
        // Relación con TimeSlot (1:N inversa)
        builder.HasOne(e => e.TimeSlot)
            .WithMany()
            .HasForeignKey(e => e.TimeSlotId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación con Pitch (1:N inversa)
        builder.HasOne(e => e.Pitch)
            .WithMany()
            .HasForeignKey(e => e.PitchId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación con User/Profile (1:N inversa)
        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Filtro global: solo reservas no eliminadas
        builder.HasQueryFilter(e => e.DeletedAt == null);
    }
}
