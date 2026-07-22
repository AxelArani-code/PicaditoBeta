using System;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence.Repositories;
using Picadito.Infrastructure.Persistence;
using Picadito.Infrastructure.Services;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using Picadito.Application.Features.Pitches.Commands.CreatePitch;
using Picadito.Application.Features.Pitches.Queries.GetAllPitches;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Picadito.Application.Features.Bookings.Queries.GetBookings;
using Picadito.Application.Features.Bookings.Queries.GetBookingById;
using Picadito.Application.Features.Bookings.Commands.ConfirmBooking;
using Picadito.Application.Features.Bookings.Commands.RejectBooking;
using Picadito.Application.Features.Bookings.Commands.CancelBooking;
using Picadito.Application.Features.Venues.Commands.CreateVenue;
using Picadito.Application.Features.Venues.Commands.UpdateVenue;
using Picadito.Application.Features.Venues.Commands.DeleteVenue;
using Picadito.Application.Features.Venues.Queries.GetAllVenues;
using Picadito.Application.Features.Venues.Queries.GetVenueById;
using Picadito.Application.Features.Pitches.Queries.GetPitchById;
using Picadito.Application.Features.Pitches.Commands.UpdatePitch;
using Picadito.Application.Features.Pitches.Commands.DeletePitch;
using Picadito.Application.Features.Profiles.Queries.GetMyProfile;
using Picadito.Application.Features.Profiles.Queries.GetProfileById;
using Picadito.Application.Features.Profiles.Queries.GetAllProfiles;
using Picadito.Application.Features.Profiles.Commands.UpdateProfile;
using Picadito.Application.Features.Profiles.Commands.DeleteProfile;
using Picadito.Application.Features.AvailabilityRules.Commands.CreateAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Commands.UpdateAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Commands.DeleteAvailabilityRule;
using Picadito.Application.Features.AvailabilityRules.Queries.GetAllAvailabilityRules;
using Picadito.Application.Features.AvailabilityRules.Queries.GetAvailabilityRuleById;
using Picadito.Application.Features.TimeSlots.Commands.CreateTimeSlot;
using Picadito.Application.Features.TimeSlots.Queries.GetAllTimeSlots;
using Picadito.Application.Features.TimeSlots.Queries.GetTimeSlotById;
using Picadito.Application.Features.Matches.Commands.CreateMatch;
using Picadito.Application.Features.Matches.Commands.UpdateMatch;
using Picadito.Application.Features.Matches.Queries.GetAllMatches;
using Picadito.Application.Features.Matches.Queries.GetMatchById;
using Picadito.Application.Features.Teams.Commands.CreateTeam;
using Picadito.Application.Features.Teams.Commands.UpdateTeam;
using Picadito.Application.Features.Teams.Commands.DeleteTeam;
using Picadito.Application.Features.Teams.Queries.GetAllTeams;
using Picadito.Application.Features.Teams.Queries.GetTeamById;
using Picadito.Application.Features.TeamMembers.Commands.CreateTeamMember;
using Picadito.Application.Features.TeamMembers.Commands.UpdateTeamMember;
using Picadito.Application.Features.TeamMembers.Commands.DeleteTeamMember;
using Picadito.Application.Features.TeamMembers.Queries.GetAllTeamMembers;
using Picadito.Application.Features.TeamMembers.Queries.GetTeamMemberById;
using Picadito.Application.Features.Notifications.Commands.CreateNotification;
using Picadito.Application.Features.Notifications.Commands.UpdateNotification;
using Picadito.Application.Features.Notifications.Commands.DeleteNotification;
using Picadito.Application.Features.Notifications.Queries.GetAllNotifications;
using Picadito.Application.Features.Notifications.Queries.GetNotificationById;
using Picadito.Application.Features.VenueRatings.Commands.CreateVenueRating;
using Picadito.Application.Features.VenueRatings.Commands.DeleteVenueRating;
using Picadito.Application.Features.VenueRatings.Queries.GetAllVenueRatings;
using Picadito.Application.Features.VenueRatings.Queries.GetVenueRatingById;
using Picadito.Application.Features.AuditLogs.Commands.CreateAuditLog;
using Picadito.Application.Features.AuditLogs.Queries.GetAllAuditLogs;
using Picadito.Application.Features.AuditLogs.Queries.GetAuditLogById;
using Picadito.Application.Features.VenueClosures.Commands.CreateVenueClosure;
using Picadito.Application.Features.VenueClosures.Commands.DeleteVenueClosure;
using Picadito.Application.Features.VenueClosures.Queries.GetAllVenueClosures;
using Picadito.Application.Features.VenueClosures.Queries.GetVenueClosureById;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURACIÓN DE BASE DE DATOS (Npgsql)
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'DefaultConnection'.");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<BookingStatus>("booking_status");
dataSourceBuilder.MapEnum<SlotStatus>("slot_status");
dataSourceBuilder.MapEnum<MatchStatus>("match_status");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));

// ================================
// 1.B DEFINIR LA POLÍTICA DE CORS
// ================================  
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()    // Permite peticiones desde cualquier origen
              .AllowAnyMethod()    // Permite cualquier método (GET, POST, PUT, DELETE, etc.)
              .AllowAnyHeader();   // Permite cualquier cabecera HTTP
    });
});

// ==========================================
// 2. SERVICIOS DE APLICACIÓN e INFRAESTRUCTURA
// ==========================================
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor(); // Necesario para CurrentUserService
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddProblemDetails(); // Middleware para formatear errores automáticamente como ProblemDetails
builder.Services.AddOpenApi();

// Repositorios y Handlers
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<IPitchRepository, PitchRepository>();
builder.Services.AddScoped<IVenueRepository, VenueRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IAvailabilityRuleRepository, AvailabilityRuleRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<ITeamMemberRepository, TeamMemberRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IVenueRatingRepository, VenueRatingRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IVenueClosureRepository, VenueClosureRepository>();
builder.Services.AddScoped<CreateBookingHandler>();
builder.Services.AddScoped<ConfirmBookingHandler>();
builder.Services.AddScoped<RejectBookingHandler>();
builder.Services.AddScoped<CancelBookingHandler>();
builder.Services.AddScoped<GetBookingsHandler>();
builder.Services.AddScoped<GetBookingByIdHandler>();

// Pitch Handlers
builder.Services.AddScoped<GetPitchByIdHandler>();
builder.Services.AddScoped<CreatePitchHandler>();
builder.Services.AddScoped<GetAllPitchesHandler>();
builder.Services.AddScoped<UpdatePitchHandler>();
builder.Services.AddScoped<DeletePitchHandler>();

// Venue Handlers
builder.Services.AddScoped<CreateVenueHandler>();
builder.Services.AddScoped<UpdateVenueHandler>();
builder.Services.AddScoped<DeleteVenueHandler>();
builder.Services.AddScoped<GetAllVenuesHandler>();
builder.Services.AddScoped<GetVenueByIdHandler>();

// AvailabilityRule Handlers
builder.Services.AddScoped<CreateAvailabilityRuleHandler>();
builder.Services.AddScoped<UpdateAvailabilityRuleHandler>();
builder.Services.AddScoped<DeleteAvailabilityRuleHandler>();
builder.Services.AddScoped<GetAllAvailabilityRulesHandler>();
builder.Services.AddScoped<GetAvailabilityRuleByIdHandler>();

// TimeSlot Handlers
builder.Services.AddScoped<CreateTimeSlotHandler>();
builder.Services.AddScoped<GetAllTimeSlotsHandler>();
builder.Services.AddScoped<GetTimeSlotByIdHandler>();

// Match Handlers
builder.Services.AddScoped<CreateMatchHandler>();
builder.Services.AddScoped<GetAllMatchesHandler>();
builder.Services.AddScoped<GetMatchByIdHandler>();
builder.Services.AddScoped<UpdateMatchHandler>();

// Team Handlers
builder.Services.AddScoped<CreateTeamHandler>();
builder.Services.AddScoped<UpdateTeamHandler>();
builder.Services.AddScoped<DeleteTeamHandler>();
builder.Services.AddScoped<GetAllTeamsHandler>();
builder.Services.AddScoped<GetTeamByIdHandler>();

// TeamMember Handlers
builder.Services.AddScoped<CreateTeamMemberHandler>();
builder.Services.AddScoped<UpdateTeamMemberHandler>();
builder.Services.AddScoped<DeleteTeamMemberHandler>();
builder.Services.AddScoped<GetAllTeamMembersHandler>();
builder.Services.AddScoped<GetTeamMemberByIdHandler>();

// Notification Handlers
builder.Services.AddScoped<CreateNotificationHandler>();
builder.Services.AddScoped<UpdateNotificationHandler>();
builder.Services.AddScoped<DeleteNotificationHandler>();
builder.Services.AddScoped<GetAllNotificationsHandler>();
builder.Services.AddScoped<GetNotificationByIdHandler>();

// VenueRating Handlers
builder.Services.AddScoped<CreateVenueRatingHandler>();
builder.Services.AddScoped<DeleteVenueRatingHandler>();
builder.Services.AddScoped<GetAllVenueRatingsHandler>();
builder.Services.AddScoped<GetVenueRatingByIdHandler>();

// AuditLog Handlers
builder.Services.AddScoped<CreateAuditLogHandler>();
builder.Services.AddScoped<GetAllAuditLogsHandler>();
builder.Services.AddScoped<GetAuditLogByIdHandler>();

// VenueClosure Handlers
builder.Services.AddScoped<CreateVenueClosureHandler>();
builder.Services.AddScoped<DeleteVenueClosureHandler>();
builder.Services.AddScoped<GetAllVenueClosuresHandler>();
builder.Services.AddScoped<GetVenueClosureByIdHandler>();

// Profile Handlers
builder.Services.AddScoped<GetMyProfileHandler>();
builder.Services.AddScoped<GetProfileByIdHandler>();
builder.Services.AddScoped<GetAllProfilesHandler>();
builder.Services.AddScoped<UpdateProfileHandler>();
builder.Services.AddScoped<DeleteProfileHandler>();

// Validaciones
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreatePitchValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateVenueCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateVenueCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllVenuesQueryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateProfileValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateAvailabilityRuleValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateTimeSlotValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateMatchValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateTeamCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateTeamCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllTeamsQueryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateTeamMemberCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateTeamMemberCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllTeamMembersQueryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateNotificationCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateNotificationCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllNotificationsQueryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateVenueRatingCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllVenueRatingsQueryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetBookingByIdQueryValidator>();

// AuditLog Validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateAuditLogCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllAuditLogsQueryValidator>();

// VenueClosure Validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateVenueClosureCommandValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<GetAllVenueClosuresQueryValidator>();

// ==========================================
// 3. SEGURIDAD (JWT & Auth)
// ==========================================
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // Esto evita que "sub" se convierta en "http://xmlsoap.org"

var jwtSecret = builder.Configuration["JwtSettings:Secret"]
    ?? throw new InvalidOperationException("JWT secret no esta configurado. Revisa tus User Secrets.");

var key = Encoding.ASCII.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Supabase no siempre valida el Issuer por defecto
        ValidateAudience = true,
        ValidAudience = "authenticated", // Este es el valor por defecto en Supabase
 
    };

});
 
// ==========================================
// 4. MONITOREO (HealthChecks)
// ==========================================
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

var app = builder.Build();

// ==========================================
// 5. PIPELINE DE MIDDLEWARES (HTTP)
// ==========================================
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Habilitar OpenAPI (documento JSON)
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Picadito API");
    });
}
 
app.UseStatusCodePages(); // Respuestas automaticas para codigos de estado.
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// HealthCheck Endpoint con Formato JSON
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new {
                name = e.Key,
                status = e.Value.Status.ToString(),
                error = e.Value.Exception?.Message
            })
        });

        await context.Response.WriteAsync(result);
    }
});

app.MapControllers();

app.Run();
