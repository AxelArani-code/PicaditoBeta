using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

public class AvailabilityRuleConfiguration : IEntityTypeConfiguration<AvailabilityRule>
{
    public void Configure(EntityTypeBuilder<AvailabilityRule> builder)
    {
        builder.ToTable("availability_rules");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.PitchId).HasColumnName("pitch_id");

        builder.Property(e => e.DayOfWeek)
            .HasColumnName("day_of_week")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(e => e.StartTime)
            .HasColumnName("start_time")
            .HasColumnType("time without time zone")
            .IsRequired();

        builder.Property(e => e.EndTime)
            .HasColumnName("end_time")
            .HasColumnType("time without time zone")
            .IsRequired();

        builder.Property(e => e.PriceOverride)
            .HasColumnName("price_override")
            .HasColumnType("numeric(10,2)");

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
