using Microsoft.EntityFrameworkCore;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence.Configurations;

namespace Picadito.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<Pitch> Pitches => Set<Pitch>();
    public DbSet<Profile> Profiles => Set<Profile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        // 1. Registra los enums globalmente
        modelBuilder.HasPostgresEnum<BookingStatus>("booking_status");
        modelBuilder.HasPostgresEnum<SlotStatus>("slot_status");
        modelBuilder.HasPostgresEnum<PitchType>("pitch_type");
        modelBuilder.HasPostgresEnum<SurfaceType>("pitch_surface");

        // 2. Aplica las configuraciones de Entity Type Configuration
        modelBuilder.ApplyConfiguration(new BookingConfiguration());

        // Mapeo de la tabla TIME_SLOTS
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

        // Mapeo de la tabla PITCHES
        modelBuilder.Entity<Pitch>(entity =>
        {
            entity.ToTable("pitches");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.VenueId).HasColumnName("venue_id");
            
            entity.Property(e => e.Type)
                .HasColumnName("type")
                .HasConversion<string>();
            
            entity.Property(e => e.Surface)
                .HasColumnName("surface")
                .HasConversion<string>();
            
            entity.Property(e => e.PricePerHour)
                .HasColumnName("price_per_hour")
                .HasPrecision(10, 2);
            
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");

            entity.HasOne(p => p.Venue)
                  .WithMany(v => v.Pitches)
                  .HasForeignKey(p => p.VenueId);
            
            entity.HasQueryFilter(p => p.DeletedAt == null);
        });

        // Mapeo de la tabla VENUES
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

        // Mapeo de la tabla PROFILES
        modelBuilder.Entity<Profile>(entity =>
        {
            entity.ToTable("profiles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.FullName).HasColumnName("full_name");
            entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });
    }
}

