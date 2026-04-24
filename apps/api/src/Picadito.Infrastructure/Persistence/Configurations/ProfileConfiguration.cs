using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Picadito.Domain.Entities;

namespace Picadito.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de Entity Framework para la entidad Profile.
/// </summary>
public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    /// <summary>
    /// Configura el mapeo de la entidad Profile a la tabla 'profiles'.
    /// </summary>
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.ToTable("profiles");
        builder.HasKey(e => e.Id);

        // Mapeo de propiedades básicas
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Username).HasColumnName("username");
        builder.Property(e => e.FullName).HasColumnName("full_name");
        builder.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
        builder.Property(e => e.Role).HasColumnName("role");

        // Columnas de auditoría
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .ValueGeneratedOnAdd()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .ValueGeneratedOnAddOrUpdate()
            .Metadata.SetBeforeSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
    }
}
