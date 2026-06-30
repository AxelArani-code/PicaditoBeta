using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

public class VenueRatingConfiguration : IEntityTypeConfiguration<VenueRating>
{
    public void Configure(EntityTypeBuilder<VenueRating> builder)
    {
        builder.ToTable("venue_ratings");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.VenueId).HasColumnName("venue_id");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.MatchId).HasColumnName("match_id");
        builder.Property(e => e.Rating).HasColumnName("rating");
        builder.Property(e => e.Comment).HasColumnName("comment");
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.HasOne(e => e.Venue)
            .WithMany()
            .HasForeignKey(e => e.VenueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Match)
            .WithMany()
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => new { e.UserId, e.MatchId })
            .IsUnique()
            .HasDatabaseName("idx_venue_ratings_user_match");
    }
}
