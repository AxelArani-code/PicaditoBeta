using System;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence.Repositories;
using Picadito.Infrastructure.Persistence;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using Picadito.Application.Features.Pitches.Queries.GetAllPitches;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Picadito.Application.Features.Bookings.Queries.GetBookings;
using Picadito.Application.Features.Bookings.Commands.ConfirmBooking;
using Picadito.Application.Features.Bookings.Commands.RejectBooking;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURACIÓN DE BASE DE DATOS (Npgsql)
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'DefaultConnection'.");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<BookingStatus>("booking_status");
dataSourceBuilder.MapEnum<SlotStatus>("slot_status");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));

// ==========================================
// 2. SERVICIOS DE APLICACIÓN e INFRAESTRUCTURA
// ==========================================
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor(); // Necesario para acceder al HttpContext en los Handlers (para JWT)
builder.Services.AddProblemDetails(); // Middleware para formatear errores automáticamente como ProblemDetails
builder.Services.AddOpenApi();

// Repositorios y Handlers
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<IPitchRepository, PitchRepository>();
builder.Services.AddScoped<CreateBookingHandler>();
builder.Services.AddScoped<ConfirmBookingHandler>();
builder.Services.AddScoped<RejectBookingHandler>();
builder.Services.AddScoped<GetBookingsHandler>();
builder.Services.AddScoped<GetAllPitchesHandler>();

// Validaciones
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingCommandValidator>();

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
        ValidAudience = "authenticated" // Este es el valor por defecto en Supabase
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
