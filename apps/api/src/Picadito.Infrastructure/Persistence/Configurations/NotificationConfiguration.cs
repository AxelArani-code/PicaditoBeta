using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.Title).HasColumnName("title");
        builder.Property(e => e.Message).HasColumnName("message");
        builder.Property(e => e.Type).HasColumnName("type");
        builder.Property(e => e.IsRead).HasColumnName("is_read").HasDefaultValue(false);
        builder.Property(e => e.Link).HasColumnName("link");
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("idx_notifications_user_unread")
            .HasFilter("\"is_read\" = false");
    }
}
