using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options) { }

        public DbSet<Activity> Activities { get; set; }
        public DbSet<UserActivity> UserActivities { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<UserFollowing> Followings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<UserActivity>(x => x.HasKey(ua => new { ua.AppUserId, ua.ActivityId }));
            builder.Entity<UserActivity>()
                .HasOne(u => u.Activity)
                .WithMany(a => a.UserActivities)
                .HasForeignKey(u => u.AppUserId);

            builder.Entity<UserActivity>()
                .HasOne(a => a.Activity)
                .WithMany(u => u.UserActivities)
                .HasForeignKey(a => a.ActivityId);

            builder.Entity<UserFollowing>(b =>
            {
                b.HasKey(k => new { k.ObserverId, k.TargetId });

                b.HasOne(o => o.Observer)
                    .WithMany(f => f.Followings)
                    .HasForeignKey(o => o.ObserverId)
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(o => o.Target)
                    .WithMany(f => f.Followers)
                    .HasForeignKey(o => o.TargetId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Activity>(entity => entity.Property("Id").HasColumnType("varchar(255)"));
            builder.Entity<Activity>(entity => entity.Property("Date").HasColumnType("DateTime"));
            builder.Entity<IdentityRole>(entity => entity.Property("Id").HasColumnType("varchar(255)"));
            builder.Entity<IdentityRoleClaim<string>>(entity => entity.Property("RoleId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserClaim<string>>(entity => entity.Property("UserId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserLogin<string>>(entity => entity.Property("LoginProvider").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserLogin<string>>(entity => entity.Property("ProviderKey").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserLogin<string>>(entity => entity.Property("UserId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserRole<string>>(entity => entity.Property("RoleId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserRole<string>>(entity => entity.Property("UserId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserToken<string>>(entity => entity.Property("UserId").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserToken<string>>(entity => entity.Property("Name").HasColumnType("varchar(255)"));
            builder.Entity<IdentityUserToken<string>>(entity => entity.Property("LoginProvider").HasColumnType("varchar(255)"));
            builder.Entity<Comment>(entity => entity.Property("Id").HasColumnType("varchar(255)"));
            builder.Entity<Comment>(entity => entity.Property("ActivityId").HasColumnType("varchar(255)"));
            builder.Entity<Comment>(entity => entity.Property("AuthorId").HasColumnType("varchar(255)"));
            builder.Entity<Comment>(entity => entity.Property("CreatedAt").HasColumnType("DateTime"));
            builder.Entity<Photo>(entity => entity.Property("Id").HasColumnType("varchar(255)"));
            builder.Entity<Photo>(entity => entity.Property("AppUserId").HasColumnType("varchar(255)"));
            builder.Entity<UserFollowing>(entity => entity.Property("ObserverId").HasColumnType("varchar(255)"));
            builder.Entity<UserFollowing>(entity => entity.Property("TargetId").HasColumnType("varchar(255)"));
            builder.Entity<UserActivity>(entity => entity.Property("AppUserId").HasColumnType("varchar(255)"));
            builder.Entity<UserActivity>(entity => entity.Property("ActivityId").HasColumnType("varchar(255)"));
            builder.Entity<UserActivity>(entity => entity.Property("DateJoined").HasColumnType("DateTime"));
            builder.Entity<IdentityRole>(entity => entity.Property(m => m.NormalizedName).HasColumnType("varchar(255)"));
            builder.Entity<AppUser>(entity => entity.Property(m => m.Id).HasColumnType("varchar(255)"));
            builder.Entity<AppUser>(entity => entity.Property(m => m.NormalizedEmail).HasColumnType("varchar(255)"));
            builder.Entity<AppUser>(entity => entity.Property(m => m.NormalizedUserName).HasColumnType("varchar(255)"));
        }
    }
}