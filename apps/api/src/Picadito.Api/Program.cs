using System;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Picadito.Application.Common.Interfaces;
using Picadito.Domain.Enums;
using Picadito.Infrastructure.Persistence.Repositories;
using Picadito.Infrastructure.Persistence;
using Picadito.Application.Features.Bookings.Commands.CreateBooking;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<BookingStatus>("booking_status");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));
// Registra todos los validadores del assembly actual
builder.Services.AddValidatorsFromAssemblyContaining<CreateBookingCommandValidator>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ITimeSlotRepository, TimeSlotRepository>();
builder.Services.AddScoped<CreateBookingHandler>();
builder.Services.AddControllers();

// !!!!!! En producción, este valor debería venir de una variable de 
// entorno --------------------------------------
// o un servicio de gestión de secretos. ---------------------!!!!!!

// Esto evita que "sub" se convierta en "http://xmlsoap.org"
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var jwtSecret = builder.Configuration["JwtSettings:Secret"];

// Validación básica para asegurarnos de que el JWT Secret esté configurado
if (string.IsNullOrEmpty(jwtSecret)) 
{
    throw new Exception("JWT Secret no configurado. Revisa tus User Secrets.");
}
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
// Obligatorio para el Handler que necesita acceso al HttpContext para obtener el UserId del token JWT
builder.Services.AddHttpContextAccessor(); 

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Agrega los servicios necesarios para ProblemDetails
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Habilita el middleware para que las respuestas automáticas (como 404) 
// también usen el formato ProblemDetails
app.UseStatusCodePages(); 

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
