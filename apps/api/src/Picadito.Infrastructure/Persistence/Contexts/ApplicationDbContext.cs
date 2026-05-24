using Microsoft.EntityFrameworkCore;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;

namespace Picadito.Infrastructure.Persistence;

/// <summary>
/// Contexto de base de datos de la aplicación.
/// Configura el mapeo de entidades usando IEntityTypeConfiguration.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<Pitch> Pitches => Set<Pitch>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<AvailabilityRule> AvailabilityRules => Set<AvailabilityRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Registra los enums de PostgreSQL globalmente
        modelBuilder.HasPostgresEnum<BookingStatus>("booking_status");
        modelBuilder.HasPostgresEnum<SlotStatus>("slot_status");
        modelBuilder.HasPostgresEnum<PitchType>("pitch_type");
        modelBuilder.HasPostgresEnum<SurfaceType>("pitch_surface");

        // 2. Aplica automáticamente todas las configuraciones de entidades
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
