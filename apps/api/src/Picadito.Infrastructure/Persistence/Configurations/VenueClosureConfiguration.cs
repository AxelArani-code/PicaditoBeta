using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

public class VenueClosureConfiguration : IEntityTypeConfiguration<VenueClosure>
{
    public void Configure(EntityTypeBuilder<VenueClosure> builder)
    {
        builder.ToTable("venue_closures");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.PitchId).HasColumnName("pitch_id");

        builder.Property(e => e.ClosureDate)
            .HasColumnName("closure_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(e => e.StartTime)
            .HasColumnName("start_time")
            .HasColumnType("time without time zone");

        builder.Property(e => e.EndTime)
            .HasColumnName("end_time")
            .HasColumnType("time without time zone");

        builder.Property(e => e.Reason)
            .HasColumnName("reason");

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.HasOne(e => e.Pitch)
            .WithMany()
            .HasForeignKey(e => e.PitchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
