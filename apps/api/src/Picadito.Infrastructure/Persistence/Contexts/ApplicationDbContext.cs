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
}
}

