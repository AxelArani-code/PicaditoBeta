using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad MatchPlayer.
/// </summary>
public class MatchPlayerConfiguration : IEntityTypeConfiguration<MatchPlayer>
{
    public void Configure(EntityTypeBuilder<MatchPlayer> builder)
    {
        builder.ToTable("match_players");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.MatchId).HasColumnName("match_id");
        builder.Property(e => e.TeamId).HasColumnName("team_id");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.GuestName).HasColumnName("guest_name");
        builder.Property(e => e.TeamSide).HasColumnName("team_side");
        builder.Property(e => e.IsMvp).HasColumnName("is_mvp").HasDefaultValue(false);
        builder.Property(e => e.Goals).HasColumnName("goals").HasDefaultValue(0);
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd();

        builder.HasOne(e => e.Match)
            .WithMany(m => m.MatchPlayers)
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.MatchId)
            .HasDatabaseName("idx_match_players_match");

        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("idx_match_players_user");
    }
}
