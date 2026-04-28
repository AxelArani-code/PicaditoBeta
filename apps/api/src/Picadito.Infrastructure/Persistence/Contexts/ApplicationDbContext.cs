using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;

namespace Picadito.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<Pitch> Pitches => Set<Pitch>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // 1. Registra el enum globalmente
    modelBuilder.HasPostgresEnum<BookingStatus>("booking_status");
    modelBuilder.HasPostgresEnum<SlotStatus>("slot_status");

    // Mapeo de la tabla BOOKINGS
    modelBuilder.Entity<Booking>(entity =>
    {
        entity.ToTable("bookings");
        entity.HasKey(e => e.Id);

        // Mapeo de nombres
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.TimeSlotId).HasColumnName("time_slot_id");
        entity.Property(e => e.PitchId).HasColumnName("pitch_id");
        entity.Property(e => e.UserId).HasColumnName("user_id");
        entity.Property(e => e.Date).HasColumnName("date");
        entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasPrecision(18, 2);


        // Columnas automáticas (ignorar en el INSERT)
        entity.Property<BookingStatus>("Status")
            .HasColumnName("status")
            .HasConversion(new EnumToStringConverter<BookingStatus>())
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        entity.Property<DateTime>("CreatedAt")
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        entity.Property<string>("PaymentStatus")
            .HasColumnName("payment_status")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
    });

    // Mapeo de la tabla existente TIME_SLOTS
    modelBuilder.Entity<TimeSlot>(entity =>
    {
        entity.ToTable("time_slots");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.PitchId).HasColumnName("pitch_id");
        entity.Property(e => e.Date).HasColumnName("date");
        entity.Property(e => e.Price).HasColumnName("price").HasPrecision(10, 2);
        entity.Property(e => e.Status).HasColumnName("status");
    });

    // Mapeo de la tabla existente PITCHES
    modelBuilder.Entity<Pitch>(entity =>
    {
        entity.ToTable("pitches");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Name).HasColumnName("name");
        entity.Property(e => e.VenueId).HasColumnName("venue_id");
        
        // Mapeo del enum Type como string (5v5, 7v7, 9v9, 11v11)
        entity.Property(e => e.Type)
            .HasColumnName("type")
            .HasConversion<string>();
        
        // Mapeo del enum Surface como string (cesped_natural, sintetico, cemento, parquet)
        entity.Property(e => e.Surface)
            .HasColumnName("surface")
            .HasConversion<string>();
        
        entity.Property(e => e.PricePerHour)
            .HasColumnName("price_per_hour")
            .HasPrecision(10, 2);
        
        entity.Property(e => e.IsActive)
            .HasColumnName("is_active");
        
        entity.Property(e => e.CreatedAt)
            .HasColumnName("created_at");
        
        entity.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at");
        
        entity.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        // Configuración de la relación con Venue
        entity.HasOne(p => p.Venue)
              .WithMany(v => v.Pitches)
              .HasForeignKey(p => p.VenueId);
        
        // Filtro global: solo canchas no eliminadas
        entity.HasQueryFilter(p => p.DeletedAt == null);
    });

    // Mapeo de la tabla existente VENUES
    modelBuilder.Entity<Venue>(entity =>
    {
        entity.ToTable("venues");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Name).HasColumnName("name");
        entity.Property(e => e.Address).HasColumnName("address");
        entity.Property(e => e.OwnerId).HasColumnName("owner_id");
        entity.Property(e => e.Description).HasColumnName("description");
        entity.Property(e => e.IsActive).HasColumnName("is_active");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
    });
}
}

