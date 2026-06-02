using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;
using Picadito.Domain.Enums;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad Match.
/// </summary>
public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("matches");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.BookingId).HasColumnName("booking_id");
        builder.Property(e => e.VenueId).HasColumnName("venue_id");
        builder.Property(e => e.Date).HasColumnName("date");
        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasColumnType("match_status")
            .IsRequired();
        builder.Property(e => e.HomeScore).HasColumnName("home_score").HasDefaultValue(0);
        builder.Property(e => e.AwayScore).HasColumnName("away_score").HasDefaultValue(0);
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd();
        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .ValueGeneratedOnAddOrUpdate();

        // Relación: Match pertenece a un Booking (1:1)
        builder.HasOne(e => e.Booking)
            .WithOne()
            .HasForeignKey<Match>(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación: Match pertenece a un Venue
        builder.HasOne(e => e.Venue)
            .WithMany()
            .HasForeignKey(e => e.VenueId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación: Match tiene muchos MatchPlayers
        builder.HasMany(e => e.MatchPlayers)
            .WithOne(mp => mp.Match)
            .HasForeignKey(mp => mp.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        // Índices
        builder.HasIndex(e => e.BookingId)
            .IsUnique()
            .HasDatabaseName("idx_matches_booking");

        builder.HasIndex(e => new { e.VenueId, e.Date })
            .HasDatabaseName("idx_matches_venue_date");
    }
}
