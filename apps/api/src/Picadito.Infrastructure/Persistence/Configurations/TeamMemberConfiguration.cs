using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

public class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
    public void Configure(EntityTypeBuilder<TeamMember> builder)
    {
        builder.ToTable("team_members");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.TeamId).HasColumnName("team_id");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.Role).HasColumnName("role").HasDefaultValue("player");
        builder.Property(e => e.JoinedAt)
            .HasColumnName("joined_at")
            .ValueGeneratedOnAdd();

        builder.HasOne(e => e.Team)
            .WithMany(t => t.TeamMembers)
            .HasForeignKey(e => e.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.TeamId, e.UserId })
            .IsUnique()
            .HasDatabaseName("idx_team_members_team_user");
    }
}
